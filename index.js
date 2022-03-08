const YAML = require('yaml');
const core = require('@actions/core');
const EdgeGrid = require('akamai-edgegrid');
const ApiSpecConverter = require('api-spec-converter');

class Application {
	/**
	 * Class constructor.
	 */
	constructor() {
		const clientToken = core.getInput('client-token', { required: true });
		const clientSecret = core.getInput('client-secret', { required: true });
		const accessToken = core.getInput('access-token', { required: true });
		const adminApiUri = core.getInput('admin-api-uri', { required: true });
		this.eg = new EdgeGrid(clientToken, clientSecret, accessToken, adminApiUri);
		this.apiServer = core.getInput('api-server', { required: false }).toLowerCase();
		this.groupId = parseInt(core.getInput('group-id', { required: true }));
		this.contractId = core.getInput('contract-id', { required: true });
		this.apiContent = core.getInput('api-content', { required: true });
		core.info('Edge Grid successfully instantiated');
	}
	
	/**
	 * Prepares the OpenAPI specification for import into the Akamai Gateway.
	 * 
	 * It performs the following adjustments:
	 * 1) If the `api-server` parameter is specified, it removes servers
	 *    whose description does not match the value provided;
	 * 2) For each resource in the API replace the description with the summary.
	 * 3) Converts API definition from OpenAPI 3 to Swagger 2 format.
	 *
	 * Through the callback, metadata extracted from the API definition is also returned.
	 *
	 * @param {Function((Object) => void)}	callback - callback to continue the workflow.
	 */
	refineOpenApiSpec(callback) {
		// Decode and parse the API definition serialised in YAML
		const input = YAML.parse(Buffer.from(this.apiContent, "base64").toString("utf8"));
		// Check that at least one server has been declared in the specification
		if (Array.isArray(input.servers) && input.servers.length > 0) {
			// Check whether to use a specific server among those in the specification
			if (this.apiServer) {
				// Writes an information message on the log
				core.info(`Search for the server whose description contains the keyword: ${this.apiServer}`);
				// Retain only the server whose description matches that provided by the 'api-server' parameter
				input.servers = input.servers.filter(server => server.description.toLowerCase().includes(this.apiServer));
				// Check if no server in its description matches the parameter provided
				if (input.servers.length == 0) {
					// Writes an error message and aborts execution
					core.setFailed(`No server matching description "${this.apiServer}" in the API definition`);
					process.exit(7);
				}
			}
		} else {
			// Writes an error message and aborts execution
			core.setFailed('No server declared in the API definition');
			process.exit(7);
		}
		// Writes an information message on the log
		core.info("Highlighting the 'summary' field for each resource.");
		// For each resource in the API replace the description with the summary
		Object.values(converted.spec.paths).forEach(function(it) {
			Object.values(it).forEach(function(it) {
				it.description = it.summary;
				delete it.summary;
			})
		});
		// Writes an information message on the log
		core.info('Converting API definition from OpenAPI 3 to Swagger 2 format');
		// Converts API definition from OpenAPI 3 to Swagger 2 format
		ApiSpecConverter.convert({
			from: 'openapi_3',
			to: 'swagger_2',
			source: input
		})
		.then(function(converted) {
			// Encode the Swagger 2 version of the API definition in base 64
			this.apiContent = Buffer.from(converted.stringify()).toString("base64");
			// Invokes the callback to continue the workflow by providing the API metadata
			callback.call(this, {
				name: converted.spec.info.title,
				version: converted.spec.info.version,
				basePath: converted.spec.basePath,
				host: converted.spec.host
			});
		}.bind(this));
	}
	
	/**
	 * Search among all API endpoints for the one with a certain name.
	 *
	 * The search is implemented through a filtered search on the metadata (these include
	 * the fields: `name`, `description`, `basePath`, `apiCategoryName` and `resourcePath`).
	 * If no endpoint meets the search criteria, {null} will be provided as a reference.
	 * 
	 * @param {string}							endPointName 	- name of the endpoint to be searched.
	 * @param {Function((Object|null) => void)}	callback		- callback that intercepts the found API endpoint.
	 */
	getEndpointByName(endPointName, callback) {
		// Invokes a recursive function to perform the search
		(function recursiveSearch(count, page) {
			// Executes the REST call to the Admin API to get the list of all endpoints that
			// contain the name specified in their metadata (they includes the fields: `name`,
			// `description`, `basePath`, `apiCategoryName` and `resourcePath`)
			this.eg.auth({
				path: '/api-definitions/v2/endpoints',
				method: 'GET',
				headers: {
					'Accept': 'application/json'
				},
				qs: {
					'contains': endPointName,
					'contractId': this.contractId,
					'groupId': this.groupId,
					'page': page
				}
			}).send(function(error, response, body) {
				// Check if the call was successful
				if (response) {
					// Gets the HTTP response body
					response = response.data;
					// Check for other endpoints not yet checked
					if (count < response.totalSize) {
						// Gets the array of endpoints contained in this search page
						let apiEndPoints = response.apiEndPoints;
						// Search this results page for the endpoint with the name provided
						let apiEndPoint = apiEndPoints.find(ep => ep.apiEndPointName == endPointName);
						// Check if the endpoint was found on this page
						if (apiEndPoint) {
							// Invokes the callback to continue
							// the workflow and consume the endpoint
							callback.call(this, apiEndPoint);
						} else {
							// Increase the counter of discarded endpoints
							count += apiEndPoints.length;
							// Check for other endpoints to be checked
							if (count < response.totalSize) {
								// Recursively invokes the function by requesting the next page
								recursiveSearch(count, page + 1);
							} else {
								// Invokes the callback inidicating that
								// the endpoint has not been found
								callback.call(this, null);
							}
						}
					} else {
						// Invokes the callback inidicating that
						// the endpoint has not been found
						callback.call(this, null);
					}
				} else {
					// Writes an error message and aborts execution
					Application.handleHttpError(error);
				}
			}.bind(this));
		}.call(this, 0, 1));
	}
	
	/**
	 * Create a new endpoint by importing an OpenAPI spec.
	 * 
	 * @param {Function((Object) => void)}	callback - callback that intercepts the newly created API endpoint.
	 */
	createEndpoint(callback) {
		// Executes the REST call to the Admin API
		this.eg.auth({
			path: '/api-definitions/v2/endpoints/files',
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: {
				'importFileFormat': 'swagger',
				'importFileSource': 'BODY_BASE64',
				'importFileContent': this.apiContent,
				'contractId': this.contractId,
				'groupId': this.groupId
			}
		}).send(function (error, response, body) {
			// Check if the call was successful
			if (response) {
				// Invokes the callback to continue
				// the workflow and consume the endpoint
				callback.call(this, response.data);
			} else {
				// Writes an error message and aborts execution
				Application.handleHttpError(error);
			}
		}.bind(this));
	}
	
	/**
	 * Updates the definition of a pre-existing API by importing an OpenAPI spec.
	 *
	 * @param {integer}						apiId			- unique identifier of the API within the Akamai Gateway.
	 * @param {integer}						versionNumber	- version number of the API within the Akamai Gateway to update.
	 * @param {boolean}						overrideVersion	- {true} to overwrite current version, {false} to upgrade
	 * @param {Function((Object) => void)}	callback		- callback that intercepts the updated API endpoint.
	 */
	updateEndpoint(apiId, versionNumber, overrideVersion, callback) {
		// Check whether to upgrade the API version
		if (overrideVersion) {
			core.info(`# Overriding definition of API ${apiId}...`);
			// Update the definition of the latest API version
			this.editVersion(apiId, versionNumber, callback);
		} else {
			core.info(`# Creation of a new version of API ${apiId}...`);
			// Clone the latest version of the API
			this.cloneVersion(apiId, versionNumber, function(cloneVersion) {
				// Update the definition of this cloned API version
				this.editVersion(apiId, cloneVersion, callback);
			});
		}
	}

	/**
	 * Clones the API definition by generating a new version.
	 *
	 * @param {integer}						apiId			- unique identifier of the API within the Akamai Gateway.
	 * @param {integer}						versionNumber	- version number of the API within the Akamai Gateway to be cloned.
	 * @param {Function((integer) => void)}	callback		- callback that intercepts the version number of the clone.
	 */
	cloneVersion(apiId, versionNumber, callback) {
		core.info(`>> Cloning of API ${apiId} version ${versionNumber} in progress...`);
		// Executes the REST call to the Admin API
		this.eg.auth({
			path: `/api-definitions/v2/endpoints/${apiId}/versions/${versionNumber}/cloneVersion`,
			method: 'POST',
			headers: {
				'Accept': 'application/json'
			},
		}).send(function (error, response, body) {
			// Check if the call was successful
			if (response) {
				// Retrieves the version value of the API clone
				let cloneVersion = response.data.versionNumber;
				core.info(`<< Cloned the API ${apiId} version ${versionNumber} (new version: ${cloneVersion}).`);
				// Invokes the callback that intercepts the value of the API clone version
				callback.call(this, cloneVersion);
			} else {
				// Writes an error message and aborts execution
				Application.handleHttpError(error);
			}
		}.bind(this));
	}
	
	/**
	 * Change the definition of a certain version of an API.
	 * @param {integer}						apiId			- unique identifier of the API within the Akamai Gateway.
	 * @param {integer}						versionNumber	- version number of the API within the Akamai Gateway to update.
	 * @param {Function((Object) => void)}	callback		- callback that intercepts the updated API endpoint.
	 */
	editVersion(apiId, versionNumber, callback) {
		core.info(`>> Updating the API definition ${apiId} version ${versionNumber}...`);
		// Executes the REST call to the Admin API
		this.eg.auth({
			path: `/api-definitions/v2/endpoints/${apiId}/versions/${versionNumber}/file`,
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: {
				'importFileFormat': 'swagger',
				'importFileSource': 'BODY_BASE64',
				'importFileContent': this.apiContent,
				'contractId': this.contractId,
				'groupId': this.groupId
			}
		}).send(function (error, response, body) {
			// Check if the call was successful
			if (response) {
				// Invokes the callback to continue
				// the workflow and consume the endpoint
				callback.call(this, response.data);
			} else {
				// Writes an error message and aborts execution
				Application.handleHttpError(error);
			}
		}.bind(this));
	}
	
	/**
	 * Compares two strings defining the semantic versions of two APIs
	 * to determine whether they have the same major and minon version.
	 *
	 * @param oldVersion old version of the API definition.
	 * @param newVersion old version of the API definition.
	 * @return {true} if they have the same major and minon version.
	 * @throws {Error} if the format of the versions is invalid.
	 */
	static sameMajorMinorVersion(oldVersion, newVersion) {
		const regex = /^(\d+\.\d+)/g;
		// Extracts the `x.x` segment from the old version
		oldVersion = oldVersion.match(regex);
		// Extracts the `x.x` segment from the new version
		newVersion = newVersion.match(regex);
		// Check that the formats of both versions are valid
		if ((Array.isArray(oldVersion) && oldVersion.length > 0) &&
		    (Array.isArray(newVersion) && newVersion.length > 0)) {
			// Check that the two 'x.x' segments match
			return oldVersion[0] == newVersion[0];
		} else {
			// Raises error indicating invalid version format
			throw Error("Invalid version format");
		}
	}
	
	/**
	 * Writes an error message and aborts execution.
	 *
	 * @param error - HTTP Error.
	 */
	static handleHttpError(error) {
		if (error['response'] && error.response['data']) {
			error = error.response.data;
			core.setFailed(`HTTP ${error.status} ${error.title} - ${error.detail}`);
		} else {
			core.setFailed(error);
		}
		process.exit(7);
	}
	
	/**
	 * Application main function.
	 */
	main() {
		// Log group: 'Refining API' - start
		core.startGroup('Refining API definition in progress...');
		// Prepares the OpenAPI specification for import into the Akamai Gateway
		this.refineOpenApiSpec(function(apiMetadata) {
			// Log group: 'Refining API' - complete
			core.info('Refining API definition completed.');
			core.endGroup();
			// Log group: 'Search API by name' - start
			core.startGroup(`Search API by name "${apiMetadata.name}":`);
			// Search among all API endpoints for the one with the required name
			this.getEndpointByName(apiMetadata.name, function(endPoint) {
				// Check if an endpoint with the requested name already exists
				if (endPoint) {
					// Log group: 'Search API by name' - end
					core.info(`API "${apiMetadata.name}" already exists.`);
					core.endGroup();
					// Log groudp: 'Update API definition' - start
					core.startGroup(`Update API ${endPoint.apiEndPointId} definition...`);
					// Check whether to overwrite the current version or to upgrade
					let overrideVersion = Application.sameMajorMinorVersion(endPoint.source.apiVersion, apiMetadata.version);
					// Updates the API definition by importing the new OpenAPI specification
					this.updateEndpoint(endPoint.apiEndPointId, endPoint.versionNumber, overrideVersion, function(endPoint) {
						// Exports the unique identifier of the API within the Akamai Gateway
						core.setOutput("api-endpoint-id", endPoint.apiEndPointId);
						// Exports the version number of the API within the Akamai Gateway
						core.setOutput("api-version-number", endPoint.versionNumber);
						// Operation successfully completed
						core.info(`Updated the API (ID: ${endPoint.apiEndPointId}, version: ${endPoint.versionNumber}).`);
						core.endGroup();
					});
				} else {
					// Log group: 'Search API by name' - end
					core.info(`API "${apiMetadata.name}" not found.`);
					core.endGroup();
					// Log groudp: 'Create new API definition' - start
					core.startGroup("Create new API definition...");
					// Creates a new API by importing the definition provided as input
					this.createEndpoint(function(endPoint) {
						// Exports the unique identifier of the API within the Akamai Gateway
						core.setOutput("api-endpoint-id", endPoint.apiEndPointId);
						// Exports the version number of the API within the Akamai Gateway
						core.setOutput("api-version-number", endPoint.versionNumber);
						// Operation successfully completed.
						core.info(`Created API (ID: ${endPoint.apiEndPointId}).`);
						core.endGroup();
					});
				}
			});
		});
	}
}

/**
 * Application entry point.
 */
try {
	new Application().main();
} catch(err) {
	core.setFailed(error);
	process.exit(7);
}