const YAML = require('yaml')
const EdgeGrid = require('akamai-edgegrid');
const ApiSpecConverter = require('api-spec-converter');

//Object.filterByKeys = function (obj, ...keys) {
//	return Object.fromEntries(keys.map(k => [k, obj[k]]));
//}

class Application {
	/** Class constructor. */
	constructor() {
		// Instantiates the EdgeGrid client to make REST calls to the Admin API
		this.eg = new EdgeGrid('akab-d4a2ozf3jzskwr4m-e5gxnkk7auvjfssz',
							   'JauTi8BDIGbRivKb+u1d1fZgqOoXL0SNrYX6eIkzou0=',
							   'akab-23ycuhkfpwvrifg4-a745ikkgpyv4zw7m',
							   'https://akab-jyr6nt6gfgyntyvx-kahl7s4injo7scks.luna.akamaiapis.net');
	    console.log("Edge Grid successfully instantiated!!!");
		this.apiContent = "b3BlbmFwaTogMy4wLjMNCmluZm86DQogIHZlcnNpb246IDEuMC4wLXRlc3RpbmcNCiAgdGl0bGU6IEJhY2stT2ZmIHRvIEhlcm8gLSBJS0VBIEtub3dsZWRnZSBHcmFwaA0KICB4LWxvZ286DQogICAgdXJsOiBodHRwczovL3d3dy5pa2VhLmNvbS9waC9lbi9zdGF0aWMvaWtlYS1sb2dvLmY3ZDkyMjlmODA2YjU5ZWM2NGNiLnN2Zw0KICBsaWNlbnNlOg0KICAgIG5hbWU6IElLRyBMaWNlbmNlDQogICAgdXJsOiBodHRwczovL2FwaS5pa2cub25laWlnLmNvbS9kb2NzDQogIGRlc2NyaXB0aW9uOiA+DQogICAgIyMgV2hhdCBJcyBJdD8NCg0KDQogICAgVGhlIEJhY2stT2ZmIHRvIEhlcm8gQVBJIHByb3ZpZGVzIFByb2R1Y3QgaW5mb3JtYXRpb24gdG8gYW55IElLRUEgQVBJDQogICAgY29uc3VtZXINCg0KICAgIHdpdGggYWRkaXRpb25hbCBCYWNrLU9mZiBvciBIZXJvIGF0dHJpYnV0ZXMgZm9yIElLRUEgUHJvZHVjdHMgY29udGFpbmVkDQogICAgd2l0aGluDQoNCiAgICB0aGUgSUtFQSBLbm93bGVkZ2UgR3JhcGgNCg0KDQogICAgIyMgSG93IHRvIGdldCBhY2Nlc3M/DQoNCg0KICAgIFRvIGdldCBhY2Nlc3MgdG8gdGhlIEFQSSBhbmQgRG9jdW1lbnRhdGlvbiBhYm91dCBpdCdzIGRlc2lnbiBtYWtlIGEgcmVxdWVzdA0KICAgIHZpYSBvdXIgU2VydmljZSBOb3cgcGFnZQ0KDQogICAgb3IgZW1haWwNCiAgICBba25vd2xlZGdlZ3JhcGhAaW50ZXIuaWtlYS5jb21dKG1haWx0bzprbm93bGVkZ2VncmFwaEBpbnRlci5pa2VhLmNvbSkgd2l0aA0KICAgIGFueSBxdWVzdGlvbnMNCg0KDQogICAgV2UgYWxzbyBhY2NlcHQgcmVxdWVzdHMgZm9yIG5ldyBmZWF0dXJlcw0KDQoNCiAgICA8aHIgLz4NCiAgY29udGFjdDoNCiAgICBlbWFpbDoga25vd2xlZGdlZ3JhcGhAaW50ZXIuaWtlYS5jb20NCnNlcnZlcnM6DQogIC0gdXJsOiA+LQ0KICAgICAgaHR0cHM6Ly9zd2FnZ2VyaHViLmFwaW0uaW5na2EuY29tL3ZpcnRzL0lLRUFfS25vd2xlZGdlX0dyYXBoL2JhY2stb2ZmLXRvLWhlcm8ve3ZlcnNpb259DQogICAgZGVzY3JpcHRpb246IE1vY2sNCiAgICB2YXJpYWJsZXM6DQogICAgICB2ZXJzaW9uOg0KICAgICAgICBkZWZhdWx0OiAxLjAuMC10ZXN0aW5nDQogICAgICAgIGRlc2NyaXB0aW9uOiBBUEkgVmVyc2lvbg0KICAtIHVybDogaHR0cHM6Ly9hcGkue2Vudn0uaWtnLmF6Lm9uZWlpZy5jb20vYXBpL2JhY2stb2ZmLXRvLWhlcm8ve3ZlcnNpb259DQogICAgZGVzY3JpcHRpb246IERldmVsb3BtZW50DQogICAgdmFyaWFibGVzOg0KICAgICAgZW52Og0KICAgICAgICBkZWZhdWx0OiBkZXYNCiAgICAgICAgZGVzY3JpcHRpb246IFNlcnZlciBlbnZpcm9ubWVudA0KICAgICAgdmVyc2lvbjoNCiAgICAgICAgZGVmYXVsdDogMS4wLjAtdGVzdGluZw0KICAgICAgICBkZXNjcmlwdGlvbjogQVBJIFZlcnNpb24NCiAgLSB1cmw6IGh0dHBzOi8vYXBpLmtub3dsZWRnZS5pa2VhLm5ldC9hcGlzL2JhY2stb2ZmLXRvLWhlcm8ve3ZlcnNpb259DQogICAgZGVzY3JpcHRpb246IFByb2R1Y3Rpb24NCiAgICB2YXJpYWJsZXM6DQogICAgICB2ZXJzaW9uOg0KICAgICAgICBkZWZhdWx0OiAxLjAuMC10ZXN0aW5nDQogICAgICAgIGRlc2NyaXB0aW9uOiBBUEkgVmVyc2lvbg0KdGFnczoNCiAgLSBuYW1lOiBQcm9kdWN0cw0KICAgIGRlc2NyaXB0aW9uOiBBUEkgRW5kcG9pbnRzIHJlbGF0ZWQgdG8gUHJvZHVjdCBCYWNrLU9mZiBhbmQgSGVybyBwcm9wZXJ0aWVzIGluIHRoZSBHcmFwaA0KICAtIG5hbWU6IEJhY2stT2ZmIFByb2R1Y3RzDQogICAgZGVzY3JpcHRpb246IEFQSSBFbmRwb2ludHMgcmVsYXRlZCBvbmx5IHRvIFByb2R1Y3RzIG1hcmtlZCBhcyBCYWNrLU9mZiBQcm9kdWN0cw0KICAtIG5hbWU6IEhlcm8gUHJvZHVjdHMNCiAgICBkZXNjcmlwdGlvbjogQVBJIEVuZHBvaW50cyByZWxhdGVkIG9ubHkgdG8gUHJvZHVjdHMgbWFya2VkIGFzIEhlcm8gUHJvZHVjdHMNCnBhdGhzOg0KICAvcHJvZHVjdHMve2l0ZW1Ob306DQogICAgZ2V0Og0KICAgICAgdGFnczoNCiAgICAgICAgLSBQcm9kdWN0cw0KICAgICAgc3VtbWFyeTogR2V0IEdyYXBoIFByb2R1Y3QgYnkgSXRlbSBOdW1iZXINCiAgICAgIGRlc2NyaXB0aW9uOiA+DQogICAgICAgIFRoaXMgZW5kcG9pbnQgdGFrZXMgYW4gYGl0ZW1Ob2Agb2YgYSBQcm9kdWN0IGNvbnRhaW5lZCB3aXRoaW4gdGhlDQogICAgICAgIEtub3dsZWRnZSBHcmFwaCBhbmQgcmV0dXJucyBhIGBCYWNrT2ZmVG9IZXJvUHJvZHVjdGAgd2hpY2ggY29udGFpbnMNCiAgICAgICAgYWRkaXRpb25hbCBwcm9wZXJ0aWVzLg0KDQogICAgICAgIElmIHRoZSBpdGVtIGV4aXN0cyBidXQgaXMgbmVpdGhlciBCYWNrLU9mZiBvciBIZXJvIGl0IHdpbGwgaGF2ZSBhDQogICAgICAgIGBzdHJhdGVnaWNQcmljaW5nUm9sZWAgb2YgYG5vbmVgLiBJZiB0aGUgaXRlbSBkb2VzIG5vdCBleGlzdCwgYSBgNDA0YA0KICAgICAgICB3aWxsIGJlIHJldHVybmVkDQogICAgICBvcGVyYXRpb25JZDogZ2V0UHJvZHVjdEJ5SWQNCiAgICAgIHBhcmFtZXRlcnM6DQogICAgICAgIC0gaW46IHBhdGgNCiAgICAgICAgICBuYW1lOiBpdGVtTm8NCiAgICAgICAgICBkZXNjcmlwdGlvbjogVGhlIGBpdGVtTm9gIG9yIHRoZSB0aGUgSUtFQSBQcm9kdWN0IGluIHRoZSBHcmFwaA0KICAgICAgICAgIHNjaGVtYToNCiAgICAgICAgICAgIHR5cGU6IHN0cmluZw0KICAgICAgICAgIGV4YW1wbGU6ICcxMjM0NTY3OCcNCiAgICAgICAgICByZXF1aXJlZDogdHJ1ZQ0KICAgICAgcmVzcG9uc2VzOg0KICAgICAgICAnMjAwJzoNCiAgICAgICAgICBkZXNjcmlwdGlvbjogPi0NCiAgICAgICAgICAgIEEgYEJhY2tPZmZUb0hlcm9Qcm9kdWN0YCBPYmplY3QsIG9yIDQwNCBpZiBpdCBkb2Vzbid0IGV4aXN0IGluIHRoZQ0KICAgICAgICAgICAgS25vd2xlZGdlIEdyYXBoDQogICAgICAgICAgY29udGVudDoNCiAgICAgICAgICAgIGFwcGxpY2F0aW9uL2pzb246DQogICAgICAgICAgICAgIHNjaGVtYToNCiAgICAgICAgICAgICAgICAkcmVmOiAnIy9jb21wb25lbnRzL3NjaGVtYXMvQmFja09mZlRvSGVyb1Byb2R1Y3QnDQogICAgICAgICAgICAgIGV4YW1wbGVzOg0KICAgICAgICAgICAgICAgIEJhY2stT2ZmIFByb2R1Y3Q6DQogICAgICAgICAgICAgICAgICB2YWx1ZToNCiAgICAgICAgICAgICAgICAgICAgaXRlbVR5cGU6IEFSVA0KICAgICAgICAgICAgICAgICAgICBpdGVtTm86ICcxMjM0NTY3OCcNCiAgICAgICAgICAgICAgICAgICAgaXRlbUlkZW50aWZpZXI6IEFSVC0xMjM0NTY3OA0KICAgICAgICAgICAgICAgICAgICBzdHJhdGVnaWNQcmljaW5nUm9sZTogYmFjay1vZmYNCiAgICAgICAgICAgICAgICAgICAgcHJvdGVjdHNIZXJvOg0KICAgICAgICAgICAgICAgICAgICAgIC0gJzEyMzQ1Njk5Jw0KICAgICAgICAgICAgICAgICAgICAgIC0gJzEyMzQ1Nzc3Jw0KICAgICAgICAgICAgICAgICAgICBpc1Byb3RlY3RlZEJ5OiBudWxsDQogICAgICAgICAgICAgICAgICAgIHVwc2VsbEFyZ3VtZW50czogW10NCiAgICAgICAgICAgICAgICBIZXJvIFByb2R1Y3Q6DQogICAgICAgICAgICAgICAgICB2YWx1ZToNCiAgICAgICAgICAgICAgICAgICAgaXRlbVR5cGU6IEFSVA0KICAgICAgICAgICAgICAgICAgICBpdGVtTm86ICcxMjM0NTY5OScNCiAgICAgICAgICAgICAgICAgICAgaXRlbUlkZW50aWZpZXI6IEFSVC0xMjM0NTY5OQ0KICAgICAgICAgICAgICAgICAgICBzdHJhdGVnaWNQcmljaW5nUm9sZTogaGVybw0KICAgICAgICAgICAgICAgICAgICBwcm90ZWN0c0hlcm86IFtdDQogICAgICAgICAgICAgICAgICAgIGlzUHJvdGVjdGVkQnk6ICcxMjM0NTY3OCcNCiAgICAgICAgICAgICAgICAgICAgdXBzZWxsQXJndW1lbnRzOg0KICAgICAgICAgICAgICAgICAgICAgIC0gc2hvcnRUZXh0OiBJcyBtb3JlIGNvbmZpZ3VyYWJsZQ0KICAgICAgICAgICAgICAgICAgICAgICAgbG9uZ1RleHQ6IFRoaXMgcHJvZHVjdCBjb21lcyB3aXRoIG1vcmUgY29uZmlndXJhdGlvbiBvcHRpb25zDQogICAgICAgICAgICAgICAgICAgICAgLSBzaG9ydFRleHQ6IFN1c3RhaW5hYmxlDQogICAgICAgICAgICAgICAgICAgICAgICBsb25nVGV4dDogVGhpcyBwcm9kdWN0IGlzIG1hZGUgZnJvbSBtb3JlIHN1c3RhaW5hYmxlIHByb2R1Y3RzDQogICAgICAgICAgICAgICAgICAgICAgLSBzaG9ydFRleHQ6IDEgWWVhciBHdWFyZW50ZWUNCiAgICAgICAgICAgICAgICAgICAgICAgIGxvbmdUZXh0OiBUaGlzIHByb2R1Y3QgY29tZXMgd2l0aCBhIDEgWWVhciBHdWFyZW50ZWUNCiAgICAgICAgICAgICAgICBOZWl0aGVyIEJhY2stT2ZmIG9yIEhlcm8gUHJvZHVjdDoNCiAgICAgICAgICAgICAgICAgIHZhbHVlOg0KICAgICAgICAgICAgICAgICAgICBpdGVtVHlwZTogQVJUDQogICAgICAgICAgICAgICAgICAgIGl0ZW1ObzogJzk5ODg3NzY2Jw0KICAgICAgICAgICAgICAgICAgICBpdGVtSWRlbnRpZmllcjogQVJULTk5ODg3NzY2DQogICAgICAgICAgICAgICAgICAgIHN0cmF0ZWdpY1ByaWNpbmdSb2xlOiBub25lDQogICAgICAgICAgICAgICAgICAgIHByb3RlY3RzSGVybzogW10NCiAgICAgICAgICAgICAgICAgICAgaXNQcm90ZWN0ZWRCeTogbnVsbA0KICAgICAgICAgICAgICAgICAgICB1cHNlbGxBcmd1bWVudHM6IFtdDQogICAgICAgICc0MDAnOg0KICAgICAgICAgICRyZWY6ICcjL2NvbXBvbmVudHMvcmVzcG9uc2VzL0JhZFJlcXVlc3QnDQogICAgICAgICc0MDEnOg0KICAgICAgICAgICRyZWY6ICcjL2NvbXBvbmVudHMvcmVzcG9uc2VzL05vdEF1dGhvcmlzZWQnDQogICAgICAgICc0MDQnOg0KICAgICAgICAgICRyZWY6ICcjL2NvbXBvbmVudHMvcmVzcG9uc2VzL05vdEZvdW5kJw0KICAgICAgICAnNTAwJzoNCiAgICAgICAgICAkcmVmOiAnIy9jb21wb25lbnRzL3Jlc3BvbnNlcy9JbnRlcm5hbFNlcnZlckVycm9yJw0KICAvcHJvZHVjdHMve2l0ZW1Ob30vdXBzZWxsLWFyZ3VtZW50czoNCiAgICBnZXQ6DQogICAgICB0YWdzOg0KICAgICAgICAtIFByb2R1Y3RzDQogICAgICBzdW1tYXJ5OiBSZXR1cm4gYXJyYXkgb2YgUHJvZHVjdCBVcHNlbGwgQXJndW1lbnRzDQogICAgICBkZXNjcmlwdGlvbjogPg0KICAgICAgICBSZXR1cm5zIGFuIGFycmF5IC0gaWYgdGhlIHNlbGVjdGVkIFByb2R1Y3Qgd2l0aCBgaXRlbU5vYCBpcyBhIEhlcm8NCiAgICAgICAgUHJvZHVjdCBpdCBtYXkgY29udGFpbiBhbiBhcnJheSBvZiBgVXBzZWxsQXJndW1lbnRzYCwgb3RoZXJ3aXNlIGl0IHdpbGwNCiAgICAgICAgYmUgYW4gZW1wdHkgYXJyYXkuDQoNCiAgICAgICAgVGhlIHJldHVybmVkIFVwc2VsbCBBcmd1bWVudHMgYXJyYXkgaXMgcHJvdmlkZWQgaW4gdGhlIGNvcnJlY3Qgb3JkZXIgZm9yDQogICAgICAgIGRpc3BsYXkNCiAgICAgIG9wZXJhdGlvbklkOiBnZXRVcHNlbGxBcmd1bWVudHMNCiAgICAgIHBhcmFtZXRlcnM6DQogICAgICAgIC0gaW46IHBhdGgNCiAgICAgICAgICBuYW1lOiBpdGVtTm8NCiAgICAgICAgICBkZXNjcmlwdGlvbjogVGhlIGBpdGVtTm9gIG9yIHRoZSB0aGUgSUtFQSBQcm9kdWN0IGluIHRoZSBHcmFwaA0KICAgICAgICAgIHNjaGVtYToNCiAgICAgICAgICAgIHR5cGU6IHN0cmluZw0KICAgICAgICAgIGV4YW1wbGU6ICcxMjM0NTY3OCcNCiAgICAgICAgICByZXF1aXJlZDogdHJ1ZQ0KICAgICAgcmVzcG9uc2VzOg0KICAgICAgICAnMjAwJzoNCiAgICAgICAgICBkZXNjcmlwdGlvbjogPi0NCiAgICAgICAgICAgIEFuIGFycmF5IHRoYXQgY29udGFpbnMgYFVwc2VsbEFyZ3VtZW50c2Agb2JqZWN0cyBmb3IgdGhlIHNlbGVjdGVkDQogICAgICAgICAgICBgUHJvZHVjdGAsIG9yIGVtcHR5IGFycmF5DQogICAgICAgICAgY29udGVudDoNCiAgICAgICAgICAgIGFwcGxpY2F0aW9uL2pzb246DQogICAgICAgICAgICAgIHNjaGVtYToNCiAgICAgICAgICAgICAgICB0eXBlOiBhcnJheQ0KICAgICAgICAgICAgICAgIGl0ZW1zOg0KICAgICAgICAgICAgICAgICAgJHJlZjogJyMvY29tcG9uZW50cy9zY2hlbWFzL1Vwc2VsbEFyZ3VtZW50cycNCiAgICAgICAgICAgICAgZXhhbXBsZToNCiAgICAgICAgICAgICAgICAtIHNob3J0VGV4dDogSXMgbW9yZSBjb25maWd1cmFibGUNCiAgICAgICAgICAgICAgICAgIGxvbmdUZXh0OiBUaGlzIHByb2R1Y3QgY29tZXMgd2l0aCBtb3JlIGNvbmZpZ3VyYXRpb24gb3B0aW9ucw0KICAgICAgICAgICAgICAgIC0gc2hvcnRUZXh0OiBTdXN0YWluYWJsZQ0KICAgICAgICAgICAgICAgICAgbG9uZ1RleHQ6IFRoaXMgcHJvZHVjdCBpcyBtYWRlIGZyb20gbW9yZSBzdXN0YWluYWJsZSBwcm9kdWN0cw0KICAgICAgICAgICAgICAgIC0gc2hvcnRUZXh0OiAxIFllYXIgR3VhcmVudGVlDQogICAgICAgICAgICAgICAgICBsb25nVGV4dDogVGhpcyBwcm9kdWN0IGNvbWVzIHdpdGggYSAxIFllYXIgR3VhcmVudGVlDQogICAgICAgICc0MDAnOg0KICAgICAgICAgICRyZWY6ICcjL2NvbXBvbmVudHMvcmVzcG9uc2VzL0JhZFJlcXVlc3QnDQogICAgICAgICc0MDEnOg0KICAgICAgICAgICRyZWY6ICcjL2NvbXBvbmVudHMvcmVzcG9uc2VzL05vdEF1dGhvcmlzZWQnDQogICAgICAgICc0MDQnOg0KICAgICAgICAgICRyZWY6ICcjL2NvbXBvbmVudHMvcmVzcG9uc2VzL05vdEZvdW5kJw0KICAgICAgICAnNTAwJzoNCiAgICAgICAgICAkcmVmOiAnIy9jb21wb25lbnRzL3Jlc3BvbnNlcy9JbnRlcm5hbFNlcnZlckVycm9yJw0KICAvcHJvZHVjdHMve2l0ZW1Ob30vaGVyb2VlczoNCiAgICBnZXQ6DQogICAgICB0YWdzOg0KICAgICAgICAtIFByb2R1Y3RzDQogICAgICBzdW1tYXJ5OiBHZXQgSGVyb2VzIGZvciBQcm9kdWN0DQogICAgICBkZXNjcmlwdGlvbjogPi0NCiAgICAgICAgR2V0IGFuIGFycmF5IG9mIFByb2R1Y3QgYGl0ZW1Ob2AgdGhhdCBhcmUgSGVybyBwcm9kdWN0cyBmb3IgdGhpcw0KICAgICAgICBCYWNrLU9mZiBQcm9kdWN0LCBvciBhbiBlbXB0eSBhcnJheQ0KICAgICAgb3BlcmF0aW9uSWQ6IGdldEhlcm9lc0ZvclByb2R1Y3QNCiAgICAgIHBhcmFtZXRlcnM6DQogICAgICAgIC0gaW46IHBhdGgNCiAgICAgICAgICBuYW1lOiBpdGVtTm8NCiAgICAgICAgICBkZXNjcmlwdGlvbjogVGhlIGBpdGVtTm9gIG9yIHRoZSB0aGUgSUtFQSBQcm9kdWN0IGluIHRoZSBHcmFwaA0KICAgICAgICAgIHNjaGVtYToNCiAgICAgICAgICAgIHR5cGU6IHN0cmluZw0KICAgICAgICAgIGV4YW1wbGU6ICcxMjM0NTY3OCcNCiAgICAgICAgICByZXF1aXJlZDogdHJ1ZQ0KICAgICAgcmVzcG9uc2VzOg0KICAgICAgICAnMjAwJzoNCiAgICAgICAgICBkZXNjcmlwdGlvbjogQW4gYXJyYXkgb2Ygc3RyaW5nIGBpdGVtTm9gIHZhbHVlcyBvZiBIZXJvIFByb2R1Y3RzDQogICAgICAgICAgY29udGVudDoNCiAgICAgICAgICAgIGFwcGxpY2F0aW9uL2pzb246DQogICAgICAgICAgICAgIHNjaGVtYToNCiAgICAgICAgICAgICAgICB0eXBlOiBhcnJheQ0KICAgICAgICAgICAgICAgIGl0ZW1zOg0KICAgICAgICAgICAgICAgICAgdHlwZTogc3RyaW5nDQogICAgICAgICAgICAgIGV4YW1wbGU6DQogICAgICAgICAgICAgICAgLSAnMTIzNDU2OTknDQogICAgICAgICAgICAgICAgLSAnMTIzNDU3NzcnDQogICAgICAgICc0MDAnOg0KICAgICAgICAgICRyZWY6ICcjL2NvbXBvbmVudHMvcmVzcG9uc2VzL0JhZFJlcXVlc3QnDQogICAgICAgICc0MDEnOg0KICAgICAgICAgICRyZWY6ICcjL2NvbXBvbmVudHMvcmVzcG9uc2VzL05vdEF1dGhvcmlzZWQnDQogICAgICAgICc0MDQnOg0KICAgICAgICAgICRyZWY6ICcjL2NvbXBvbmVudHMvcmVzcG9uc2VzL05vdEZvdW5kJw0KICAgICAgICAnNTAwJzoNCiAgICAgICAgICAkcmVmOiAnIy9jb21wb25lbnRzL3Jlc3BvbnNlcy9JbnRlcm5hbFNlcnZlckVycm9yJw0KICAvcHJvZHVjdHMve2l0ZW1Ob30vYmFjay1vZmY6DQogICAgZ2V0Og0KICAgICAgdGFnczoNCiAgICAgICAgLSBQcm9kdWN0cw0KICAgICAgc3VtbWFyeTogR2V0IEJhY2stT2ZmIEl0ZW0gTnVtYmVyIGZvciBQcm9kdWN0DQogICAgICBkZXNjcmlwdGlvbjogR2V0IGFuIGBpdGVtTm9gIG9mIGEgQmFjay1PZmYgUHJvZHVjdCBmcm9tIHRoZSBHcmFwaCwgb3IgZW4gZW1wdHkgc3RyaW5nDQogICAgICBvcGVyYXRpb25JZDogZ2V0QmFja09mZkZvclByb2R1Y3QNCiAgICAgIHBhcmFtZXRlcnM6DQogICAgICAgIC0gaW46IHBhdGgNCiAgICAgICAgICBuYW1lOiBpdGVtTm8NCiAgICAgICAgICBkZXNjcmlwdGlvbjogVGhlIGBpdGVtTm9gIG9yIHRoZSB0aGUgSUtFQSBQcm9kdWN0IGluIHRoZSBHcmFwaA0KICAgICAgICAgIHNjaGVtYToNCiAgICAgICAgICAgIHR5cGU6IHN0cmluZw0KICAgICAgICAgIGV4YW1wbGU6ICcxMjM0NTY3OCcNCiAgICAgICAgICByZXF1aXJlZDogdHJ1ZQ0KICAgICAgcmVzcG9uc2VzOg0KICAgICAgICAnMjAwJzoNCiAgICAgICAgICBkZXNjcmlwdGlvbjogU3RyaW5nIHZhbHVlIG9mIHRoZSBCYWNrLU9mZiBQcm9kdWN0IGBpdGVtTm9gIG9yIGFuIGVtcHR5IHN0cmluZw0KICAgICAgICAgIGNvbnRlbnQ6DQogICAgICAgICAgICBhcHBsaWNhdGlvbi9qc29uOg0KICAgICAgICAgICAgICBzY2hlbWE6DQogICAgICAgICAgICAgICAgdHlwZTogc3RyaW5nDQogICAgICAgICAgICAgIGV4YW1wbGU6ICcxMjM0NTY3OCcNCiAgICAgICAgJzQwMCc6DQogICAgICAgICAgJHJlZjogJyMvY29tcG9uZW50cy9yZXNwb25zZXMvQmFkUmVxdWVzdCcNCiAgICAgICAgJzQwMSc6DQogICAgICAgICAgJHJlZjogJyMvY29tcG9uZW50cy9yZXNwb25zZXMvTm90QXV0aG9yaXNlZCcNCiAgICAgICAgJzQwNCc6DQogICAgICAgICAgJHJlZjogJyMvY29tcG9uZW50cy9yZXNwb25zZXMvTm90Rm91bmQnDQogICAgICAgICc1MDAnOg0KICAgICAgICAgICRyZWY6ICcjL2NvbXBvbmVudHMvcmVzcG9uc2VzL0ludGVybmFsU2VydmVyRXJyb3InDQogIC9wcm9kdWN0cy9oZXJvZXM6DQogICAgZ2V0Og0KICAgICAgdGFnczoNCiAgICAgICAgLSBIZXJvIFByb2R1Y3RzDQogICAgICBzdW1tYXJ5OiBHZXQgQWxsIEdyYXBoIEhlcm8gUHJvZHVjdHMNCiAgICAgIGRlc2NyaXB0aW9uOiA+LQ0KICAgICAgICBSZXR1cm5zIGFuIGFycmF5IHRoYXQgY29udGFpbnMgYWxsIEhlcm8gcHJvZHVjdHMgZnJvbSB0aGUgR3JhcGggLQ0KICAgICAgICBvcHRpb25hbGx5IGNhbiB0YWtlIGEgYHVwZGF0ZWRTaW5jZWAgcXVlcnksIG9yIGEgbGlzdCBvZiBgaXRlbU5vYCB0bw0KICAgICAgICByZXR1cm4gc3BlY2lmaWMgaXRlbXMNCiAgICAgIG9wZXJhdGlvbklkOiBnZXRIZXJvUHJvZHVjdHMNCiAgICAgIHBhcmFtZXRlcnM6DQogICAgICAgIC0gaW46IHF1ZXJ5DQogICAgICAgICAgbmFtZTogdXBkYXRlZFNpbmNlDQogICAgICAgICAgZGVzY3JpcHRpb246IE9ubHkgcmV0dXJuIEhlcm8gcHJvZHVjdHMgdXBkYXRlZCBzaW5jZSB0aGUgcGFzc2VkIGRhdGUNCiAgICAgICAgICBzY2hlbWE6DQogICAgICAgICAgICB0eXBlOiBzdHJpbmcNCiAgICAgICAgICAgIGZvcm1hdDogZGF0ZQ0KICAgICAgICAgIHJlcXVpcmVkOiBmYWxzZQ0KICAgICAgICAtIGluOiBxdWVyeQ0KICAgICAgICAgIG5hbWU6IGl0ZW1Ob3MNCiAgICAgICAgICBkZXNjcmlwdGlvbjogQSBjb21tYSAoYCxgKSBzZXBlcmF0ZWQgbGlzdCBvZiBJRHMgdG8gcmV0dXJuDQogICAgICAgICAgc2NoZW1hOg0KICAgICAgICAgICAgdHlwZTogc3RyaW5nDQogICAgICAgICAgZXhhbXBsZTogJzEyMzQ1Njc4Jw0KICAgICAgICAgIHJlcXVpcmVkOiBmYWxzZQ0KICAgICAgcmVzcG9uc2VzOg0KICAgICAgICAnMjAwJzoNCiAgICAgICAgICBkZXNjcmlwdGlvbjogPi0NCiAgICAgICAgICAgIEFuIGFycmF5IG9mIFByb2R1Y3RzIHRoYXQgYXJlIEhlcm8gUHJvZHVjdHMgd2l0aCBTdHJhdGVnaWMgUHJpY2luZywNCiAgICAgICAgICAgIEhlcm8gYW5kIEJhY2stT2ZmIHByb3BlcnRpZXMNCiAgICAgICAgICBjb250ZW50Og0KICAgICAgICAgICAgYXBwbGljYXRpb24vanNvbjoNCiAgICAgICAgICAgICAgc2NoZW1hOg0KICAgICAgICAgICAgICAgIHR5cGU6IGFycmF5DQogICAgICAgICAgICAgICAgaXRlbXM6DQogICAgICAgICAgICAgICAgICAkcmVmOiAnIy9jb21wb25lbnRzL3NjaGVtYXMvQmFja09mZlRvSGVyb1Byb2R1Y3QnDQogICAgICAgICAgICAgIGV4YW1wbGU6DQogICAgICAgICAgICAgICAgLSBpdGVtVHlwZTogQVJUDQogICAgICAgICAgICAgICAgICBpdGVtTm86ICcxMjM0NTY3OCcNCiAgICAgICAgICAgICAgICAgIGl0ZW1JZGVudGlmaWVyOiBBUlQtMTIzNDU2NzgNCiAgICAgICAgICAgICAgICAgIHN0cmF0ZWdpY1ByaWNpbmdSb2xlOiBoZXJvDQogICAgICAgICAgICAgICAgICBwcm90ZWN0c0hlcm86IFtdDQogICAgICAgICAgICAgICAgICBpc1Byb3RlY3RlZEJ5OiAnOTc1MzEyNDY4Jw0KICAgICAgICAgICAgICAgICAgdXBzZWxsQXJndW1lbnRzOg0KICAgICAgICAgICAgICAgICAgICAtIHNob3J0VGV4dDogSXMgbW9yZSBjb25maWd1cmFibGUNCiAgICAgICAgICAgICAgICAgICAgICBsb25nVGV4dDogVGhpcyBwcm9kdWN0IGNvbWVzIHdpdGggbW9yZSBjb25maWd1cmF0aW9uIG9wdGlvbnMNCiAgICAgICAgICAgICAgICAgICAgLSBzaG9ydFRleHQ6IFN1c3RhaW5hYmxlDQogICAgICAgICAgICAgICAgICAgICAgbG9uZ1RleHQ6IFRoaXMgcHJvZHVjdCBpcyBtYWRlIGZyb20gbW9yZSBzdXN0YWluYWJsZSBwcm9kdWN0cw0KICAgICAgICAgICAgICAgICAgICAtIHNob3J0VGV4dDogMSBZZWFyIEd1YXJlbnRlZQ0KICAgICAgICAgICAgICAgICAgICAgIGxvbmdUZXh0OiBUaGlzIHByb2R1Y3QgY29tZXMgd2l0aCBhIDEgWWVhciBHdWFyZW50ZWUNCiAgICAgICAgICAgICAgICAtIGl0ZW1UeXBlOiBBUlQNCiAgICAgICAgICAgICAgICAgIGl0ZW1ObzogJzEyMzQ1NjkwJw0KICAgICAgICAgICAgICAgICAgaXRlbUlkZW50aWZpZXI6IEFSVC0xMjM0NTY5MA0KICAgICAgICAgICAgICAgICAgc3RyYXRlZ2ljUHJpY2luZ1JvbGU6IGhlcm8NCiAgICAgICAgICAgICAgICAgIHByb3RlY3RzSGVybzogW10NCiAgICAgICAgICAgICAgICAgIGlzUHJvdGVjdGVkQnk6ICc5NzUzMTI0NjgnDQogICAgICAgICAgICAgICAgICB1cHNlbGxBcmd1bWVudHM6DQogICAgICAgICAgICAgICAgICAgIC0gc2hvcnRUZXh0OiBJcyBtb3JlIGNvbmZpZ3VyYWJsZQ0KICAgICAgICAgICAgICAgICAgICAgIGxvbmdUZXh0OiBUaGlzIHByb2R1Y3QgY29tZXMgd2l0aCBtb3JlIGNvbmZpZ3VyYXRpb24gb3B0aW9ucw0KICAgICAgICAgICAgICAgICAgICAtIHNob3J0VGV4dDogU3VzdGFpbmFibGUNCiAgICAgICAgICAgICAgICAgICAgICBsb25nVGV4dDogVGhpcyBwcm9kdWN0IGlzIG1hZGUgZnJvbSBtb3JlIHN1c3RhaW5hYmxlIHByb2R1Y3RzDQogICAgICAgICAgICAgICAgICAgIC0gc2hvcnRUZXh0OiAxIFllYXIgR3VhcmVudGVlDQogICAgICAgICAgICAgICAgICAgICAgbG9uZ1RleHQ6IFRoaXMgcHJvZHVjdCBjb21lcyB3aXRoIGEgMSBZZWFyIEd1YXJlbnRlZQ0KICAgICAgICAnNDAwJzoNCiAgICAgICAgICAkcmVmOiAnIy9jb21wb25lbnRzL3Jlc3BvbnNlcy9CYWRSZXF1ZXN0Jw0KICAgICAgICAnNDAxJzoNCiAgICAgICAgICAkcmVmOiAnIy9jb21wb25lbnRzL3Jlc3BvbnNlcy9Ob3RBdXRob3Jpc2VkJw0KICAgICAgICAnNDA0JzoNCiAgICAgICAgICAkcmVmOiAnIy9jb21wb25lbnRzL3Jlc3BvbnNlcy9Ob3RGb3VuZCcNCiAgICAgICAgJzUwMCc6DQogICAgICAgICAgJHJlZjogJyMvY29tcG9uZW50cy9yZXNwb25zZXMvSW50ZXJuYWxTZXJ2ZXJFcnJvcicNCiAgL3Byb2R1Y3RzL2hlcm9lcy9pdGVtTm9zOg0KICAgIGdldDoNCiAgICAgIHRhZ3M6DQogICAgICAgIC0gSGVybyBQcm9kdWN0cw0KICAgICAgc3VtbWFyeTogR2V0IEFsbCBIZXJvIFByb2R1Y3QgYGl0ZW1Ob2ANCiAgICAgIGRlc2NyaXB0aW9uOiBSZXR1cm5zIGFuIGFycmF5IG9mIGFsbCBHcmFwaCBIZXJvIFByb2R1Y3QgYGl0ZW1Ob2AgcHJvcGVydHkNCiAgICAgIG9wZXJhdGlvbklkOiBnZXRIZXJvSXRlbU51bWJlcnMNCiAgICAgIHBhcmFtZXRlcnM6DQogICAgICAgIC0gaW46IHF1ZXJ5DQogICAgICAgICAgbmFtZTogdXBkYXRlZFNpbmNlDQogICAgICAgICAgZGVzY3JpcHRpb246ID4tDQogICAgICAgICAgICBPbmx5IHJldHVybiBIZXJvIGBpdGVtTm9gIHdoZXJlIHRoZSBQcm9kdWN0IGhhcyBiZWVuIGFkZGVkIG9yDQogICAgICAgICAgICBjaGFuZ2VkIHNpbmNlIHRoZSBwYXNzZWQgZGF0ZQ0KICAgICAgICAgIHNjaGVtYToNCiAgICAgICAgICAgIHR5cGU6IHN0cmluZw0KICAgICAgICAgICAgZm9ybWF0OiBkYXRlDQogICAgICAgICAgcmVxdWlyZWQ6IGZhbHNlDQogICAgICByZXNwb25zZXM6DQogICAgICAgICcyMDAnOg0KICAgICAgICAgIGRlc2NyaXB0aW9uOiA+LQ0KICAgICAgICAgICAgQW4gYXJyYXkgb2Ygc3RyaW5nIHZhbHVlcyB0aGF0IGFyZSB0aGUgYGl0ZW1Ob2Agb2YgYWxsIEdyYXBoIEhlcm8NCiAgICAgICAgICAgIFByb2R1Y3RzDQogICAgICAgICAgY29udGVudDoNCiAgICAgICAgICAgIGFwcGxpY2F0aW9uL2pzb246DQogICAgICAgICAgICAgIHNjaGVtYToNCiAgICAgICAgICAgICAgICB0eXBlOiBhcnJheQ0KICAgICAgICAgICAgICAgIGl0ZW1zOg0KICAgICAgICAgICAgICAgICAgdHlwZTogc3RyaW5nDQogICAgICAgICAgICAgIGV4YW1wbGU6DQogICAgICAgICAgICAgICAgLSAnMTIzNDU2OTknDQogICAgICAgICAgICAgICAgLSAnMTIzNDU3NzcnDQogICAgICAgICc0MDAnOg0KICAgICAgICAgICRyZWY6ICcjL2NvbXBvbmVudHMvcmVzcG9uc2VzL0JhZFJlcXVlc3QnDQogICAgICAgICc0MDEnOg0KICAgICAgICAgICRyZWY6ICcjL2NvbXBvbmVudHMvcmVzcG9uc2VzL05vdEF1dGhvcmlzZWQnDQogICAgICAgICc0MDQnOg0KICAgICAgICAgICRyZWY6ICcjL2NvbXBvbmVudHMvcmVzcG9uc2VzL05vdEZvdW5kJw0KICAgICAgICAnNTAwJzoNCiAgICAgICAgICAkcmVmOiAnIy9jb21wb25lbnRzL3Jlc3BvbnNlcy9JbnRlcm5hbFNlcnZlckVycm9yJw0KICAvcHJvZHVjdHMvYmFjay1vZmZzOg0KICAgIGdldDoNCiAgICAgIHRhZ3M6DQogICAgICAgIC0gQmFjay1PZmYgUHJvZHVjdHMNCiAgICAgIHN1bW1hcnk6IEdldCBBbGwgR3JhcGggQmFjay1PZmYgUHJvZHVjdHMNCiAgICAgIGRlc2NyaXB0aW9uOiA+LQ0KICAgICAgICBSZXR1cm5zIGFuIGFycmF5IHRoYXQgY29udGFpbnMgYWxsIEJhY2stT2ZmIHByb2R1Y3RzIGZyb20gdGhlIEdyYXBoIC0NCiAgICAgICAgb3B0aW9uYWxseSBjYW4gdGFrZSBhIGB1cGRhdGVkU2luY2VgIHF1ZXJ5LCBvciBhIGxpc3Qgb2YgYGl0ZW1Ob2AgdG8NCiAgICAgICAgcmV0dXJuIHNwZWNpZmljIGl0ZW1zDQogICAgICBvcGVyYXRpb25JZDogZ2V0QmFja09mZlByb2R1Y3RzDQogICAgICBwYXJhbWV0ZXJzOg0KICAgICAgICAtIGluOiBxdWVyeQ0KICAgICAgICAgIG5hbWU6IHVwZGF0ZWRTaW5jZQ0KICAgICAgICAgIGRlc2NyaXB0aW9uOiBPbmx5IHJldHVybiBCYWNrLU9mZiBwcm9kdWN0cyB1cGRhdGVkIHNpbmNlIHRoZSBwYXNzZWQgZGF0ZQ0KICAgICAgICAgIHNjaGVtYToNCiAgICAgICAgICAgIHR5cGU6IHN0cmluZw0KICAgICAgICAgICAgZm9ybWF0OiBkYXRlDQogICAgICAgICAgcmVxdWlyZWQ6IGZhbHNlDQogICAgICAgIC0gaW46IHF1ZXJ5DQogICAgICAgICAgbmFtZTogaXRlbU5vcw0KICAgICAgICAgIGRlc2NyaXB0aW9uOiBBIGNvbW1hIChgLGApIHNlcGVyYXRlZCBsaXN0IG9mIElEcyB0byByZXR1cm4NCiAgICAgICAgICBzY2hlbWE6DQogICAgICAgICAgICB0eXBlOiBzdHJpbmcNCiAgICAgICAgICBleGFtcGxlOiAnMTIzNDU2NzgnDQogICAgICAgICAgcmVxdWlyZWQ6IGZhbHNlDQogICAgICByZXNwb25zZXM6DQogICAgICAgICcyMDAnOg0KICAgICAgICAgIGRlc2NyaXB0aW9uOiA+LQ0KICAgICAgICAgICAgQW4gYXJyYXkgb2YgUHJvZHVjdHMgdGhhdCBhcmUgQmFjay1PZmYgUHJvZHVjdHMgd2l0aCBTdHJhdGVnaWMNCiAgICAgICAgICAgIFByaWNpbmcsIEhlcm8gYW5kIEJhY2stT2ZmIHByb3BlcnRpZXMNCiAgICAgICAgICBjb250ZW50Og0KICAgICAgICAgICAgYXBwbGljYXRpb24vanNvbjoNCiAgICAgICAgICAgICAgc2NoZW1hOg0KICAgICAgICAgICAgICAgIHR5cGU6IGFycmF5DQogICAgICAgICAgICAgICAgaXRlbXM6DQogICAgICAgICAgICAgICAgICAkcmVmOiAnIy9jb21wb25lbnRzL3NjaGVtYXMvQmFja09mZlRvSGVyb1Byb2R1Y3QnDQogICAgICAgICAgICAgIGV4YW1wbGU6DQogICAgICAgICAgICAgICAgLSBpdGVtVHlwZTogQVJUDQogICAgICAgICAgICAgICAgICBpdGVtTm86ICc5NzUzMTI0NjgnDQogICAgICAgICAgICAgICAgICBpdGVtSWRlbnRpZmllcjogQVJULTk3NTMxMjQ2OA0KICAgICAgICAgICAgICAgICAgc3RyYXRlZ2ljUHJpY2luZ1JvbGU6IGJhY2stb2ZmDQogICAgICAgICAgICAgICAgICBwcm90ZWN0c0hlcm86DQogICAgICAgICAgICAgICAgICAgIC0gJzEyMzQ1Njc4Jw0KICAgICAgICAgICAgICAgICAgICAtICcxMjM0NTY5MCcNCiAgICAgICAgICAgICAgICAgIGlzUHJvdGVjdGVkQnk6IG51bGwNCiAgICAgICAgICAgICAgICAgIHVwc2VsbEFyZ3VtZW50czogW10NCiAgICAgICAgICAgICAgICAtIGl0ZW1UeXBlOiBBUlQNCiAgICAgICAgICAgICAgICAgIGl0ZW1ObzogJzY2Nzc5OTMzJw0KICAgICAgICAgICAgICAgICAgaXRlbUlkZW50aWZpZXI6IEFSVC02Njc3OTkzMw0KICAgICAgICAgICAgICAgICAgc3RyYXRlZ2ljUHJpY2luZ1JvbGU6IGJhY2stb2ZmDQogICAgICAgICAgICAgICAgICBwcm90ZWN0c0hlcm86DQogICAgICAgICAgICAgICAgICAgIC0gJzk3MjM5ODMzJw0KICAgICAgICAgICAgICAgICAgICAtICc5NzIzOTgzNicNCiAgICAgICAgICAgICAgICAgIGlzUHJvdGVjdGVkQnk6IG51bGwNCiAgICAgICAgICAgICAgICAgIHVwc2VsbEFyZ3VtZW50czogW10NCiAgICAgICAgJzQwMCc6DQogICAgICAgICAgJHJlZjogJyMvY29tcG9uZW50cy9yZXNwb25zZXMvQmFkUmVxdWVzdCcNCiAgICAgICAgJzQwMSc6DQogICAgICAgICAgJHJlZjogJyMvY29tcG9uZW50cy9yZXNwb25zZXMvTm90QXV0aG9yaXNlZCcNCiAgICAgICAgJzQwNCc6DQogICAgICAgICAgJHJlZjogJyMvY29tcG9uZW50cy9yZXNwb25zZXMvTm90Rm91bmQnDQogICAgICAgICc1MDAnOg0KICAgICAgICAgICRyZWY6ICcjL2NvbXBvbmVudHMvcmVzcG9uc2VzL0ludGVybmFsU2VydmVyRXJyb3InDQogIC9wcm9kdWN0cy9iYWNrLW9mZnMvaXRlbU5vczoNCiAgICBnZXQ6DQogICAgICB0YWdzOg0KICAgICAgICAtIEJhY2stT2ZmIFByb2R1Y3RzDQogICAgICBzdW1tYXJ5OiBHZXQgQWxsIEJhY2stT2ZmIFByb2R1Y3QgYGl0ZW1Ob2ANCiAgICAgIGRlc2NyaXB0aW9uOiBSZXR1cm5zIGFuIGFycmF5IG9mIGFsbCBHcmFwaCBCYWNrLU9mZiBQcm9kdWN0IGBpdGVtTm9gIHByb3BlcnR5DQogICAgICBvcGVyYXRpb25JZDogZ2V0QmFja09mZkl0ZW1OdW1iZXJzDQogICAgICBwYXJhbWV0ZXJzOg0KICAgICAgICAtIGluOiBxdWVyeQ0KICAgICAgICAgIG5hbWU6IHVwZGF0ZWRTaW5jZQ0KICAgICAgICAgIGRlc2NyaXB0aW9uOiA+LQ0KICAgICAgICAgICAgT25seSByZXR1cm4gQmFjay1PZmYgYGl0ZW1Ob2Agd2hlcmUgdGhlIFByb2R1Y3QgaGFzIGJlZW4gYWRkZWQgb3INCiAgICAgICAgICAgIGNoYW5nZWQgc2luY2UgdGhlIHBhc3NlZCBkYXRlDQogICAgICAgICAgc2NoZW1hOg0KICAgICAgICAgICAgdHlwZTogc3RyaW5nDQogICAgICAgICAgICBmb3JtYXQ6IGRhdGUNCiAgICAgICAgICByZXF1aXJlZDogZmFsc2UNCiAgICAgIHJlc3BvbnNlczoNCiAgICAgICAgJzIwMCc6DQogICAgICAgICAgZGVzY3JpcHRpb246ID4tDQogICAgICAgICAgICBBbiBhcnJheSBvZiBzdHJpbmcgdmFsdWVzIHRoYXQgYXJlIHRoZSBgaXRlbU5vYCBvZiBhbGwgR3JhcGgNCiAgICAgICAgICAgIEJhY2stT2ZmIFByb2R1Y3RzDQogICAgICAgICAgY29udGVudDoNCiAgICAgICAgICAgIGFwcGxpY2F0aW9uL2pzb246DQogICAgICAgICAgICAgIHNjaGVtYToNCiAgICAgICAgICAgICAgICB0eXBlOiBhcnJheQ0KICAgICAgICAgICAgICAgIGl0ZW1zOg0KICAgICAgICAgICAgICAgICAgdHlwZTogc3RyaW5nDQogICAgICAgICAgICAgIGV4YW1wbGU6DQogICAgICAgICAgICAgICAgLSAnOTk4ODc3NjYnDQogICAgICAgICAgICAgICAgLSAnNTU2Njg4NDQnDQogICAgICAgICc0MDAnOg0KICAgICAgICAgICRyZWY6ICcjL2NvbXBvbmVudHMvcmVzcG9uc2VzL0JhZFJlcXVlc3QnDQogICAgICAgICc0MDEnOg0KICAgICAgICAgICRyZWY6ICcjL2NvbXBvbmVudHMvcmVzcG9uc2VzL05vdEF1dGhvcmlzZWQnDQogICAgICAgICc0MDQnOg0KICAgICAgICAgICRyZWY6ICcjL2NvbXBvbmVudHMvcmVzcG9uc2VzL05vdEZvdW5kJw0KICAgICAgICAnNTAwJzoNCiAgICAgICAgICAkcmVmOiAnIy9jb21wb25lbnRzL3Jlc3BvbnNlcy9JbnRlcm5hbFNlcnZlckVycm9yJw0KY29tcG9uZW50czoNCiAgc2NoZW1hczoNCiAgICBQcm9kdWN0Og0KICAgICAgbnVsbGFibGU6IHRydWUNCiAgICAgIGRlc2NyaXB0aW9uOiBBIFByb2R1Y3QgY29udGFpbmVkIHdpdGggdGhlIElLRUEgS25vd2xlZGdlIEdyYXBoDQogICAgICBhZGRpdGlvbmFsUHJvcGVydGllczogdHJ1ZQ0KICAgICAgcHJvcGVydGllczoNCiAgICAgICAgaXRlbVR5cGU6DQogICAgICAgICAgZGVzY3JpcHRpb246IEFuIElLRUEgUHJvZHVjdCB0eXBlIChlLmcgYEFSVGAgb3IgYFNQUmApDQogICAgICAgICAgdHlwZTogc3RyaW5nDQogICAgICAgICAgZW51bToNCiAgICAgICAgICAgIC0gQVJUDQogICAgICAgICAgICAtIFNQUg0KICAgICAgICBpdGVtTm86DQogICAgICAgICAgZGVzY3JpcHRpb246IFRoZSBJS0VBIFByb2R1Y3QgaXRlbSBpdGVtIG51bWJlcg0KICAgICAgICAgIHR5cGU6IHN0cmluZw0KICAgICAgICBpdGVtSWRlbnRpZmllcjoNCiAgICAgICAgICBkZXNjcmlwdGlvbjogQSBjb21iaW5lZCBgaXRlbVR5cGVgIGFuZCBgaXRlbU5vYCB2YWx1ZSBzZXBlcmF0ZWQgYnkgYSBoeXBlbg0KICAgICAgICAgIHR5cGU6IHN0cmluZw0KICAgIFVwc2VsbEFyZ3VtZW50czoNCiAgICAgIGRlc2NyaXB0aW9uOiBVcHNlbGwgYXJndW1lbnRzIHRoYXQgYXJlIGluY2x1ZGVkIGluIGEgSGVybyBQcm9kdWN0DQogICAgICBwcm9wZXJ0aWVzOg0KICAgICAgICBzaG9ydFRleHQ6DQogICAgICAgICAgdHlwZTogc3RyaW5nDQogICAgICAgICAgZGVzY3JpcHRpb246IEEgc2hvcnRlbmVkIHZlcnNpb24gb2YgdGhlIFVwc2VsbCBBcmd1bWVudCB0ZXh0DQogICAgICAgIGxvbmdUZXh0Og0KICAgICAgICAgIHR5cGU6IHN0cmluZw0KICAgICAgICAgIGRlc2NyaXB0aW9uOiBUaGUgZnVsbCBVcHNlbGwgQXJndW1lbnQgdGV4dA0KICAgICAgcmVxdWlyZWQ6DQogICAgICAgIC0gc2hvcnRUZXh0DQogICAgICAgIC0gbG9uZ1RleHQNCiAgICBCYWNrT2ZmVG9IZXJvUHJvZHVjdDoNCiAgICAgIGFsbE9mOg0KICAgICAgICAtICRyZWY6ICcjL2NvbXBvbmVudHMvc2NoZW1hcy9Qcm9kdWN0Jw0KICAgICAgICAtIGRlc2NyaXB0aW9uOiBBIGZhY2V0IG9mIGFuIElLRUEgUHJvZHVjdCB3aXRoIEhlcm8gb3IgQmFjay1PZmYgaW5mb3JtYXRpb24NCiAgICAgICAgICBhZGRpdGlvbmFsUHJvcGVydGllczogZmFsc2UNCiAgICAgICAgICBwcm9wZXJ0aWVzOg0KICAgICAgICAgICAgc3RyYXRlZ2ljUHJpY2luZ1JvbGU6DQogICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBBIHRleHQgdmFsdWUgb2YgdGhlIHN0cmF0ZWdpYyBwcmljaW5nIHJvbGUgb2YgdGhlIHByb2R1Y3QNCiAgICAgICAgICAgICAgdHlwZTogc3RyaW5nDQogICAgICAgICAgICAgIGVudW06DQogICAgICAgICAgICAgICAgLSBiYWNrLW9mZg0KICAgICAgICAgICAgICAgIC0gaGVybw0KICAgICAgICAgICAgICAgIC0gbm9uZQ0KICAgICAgICAgICAgcHJvdGVjdHNIZXJvOg0KICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogPg0KICAgICAgICAgICAgICAgIElmIGEgQmFjay1PZmYgcHJvZHVjdCwgYW4gYXJyYXkgb2Ygc3RyaW5nIHZhbHVlIG9mIHRoZSBgaXRlbU5vYA0KICAgICAgICAgICAgICAgIG9mIHRoZSBIZXJvIHByb2R1Y3RzIHRoaXMgaXRlbSBwcm90ZWN0cywgb3RoZXJ3aXNlIGFuIGVtcHR5DQogICAgICAgICAgICAgICAgYXJyYXkNCiAgICAgICAgICAgICAgdHlwZTogYXJyYXkNCiAgICAgICAgICAgICAgaXRlbXM6DQogICAgICAgICAgICAgICAgdHlwZTogc3RyaW5nDQogICAgICAgICAgICAgICAgcGF0dGVybjogXlxkezh9JA0KICAgICAgICAgICAgaXNQcm90ZWN0ZWRCeToNCiAgICAgICAgICAgICAgZGVzY3JpcHRpb246ID4tDQogICAgICAgICAgICAgICAgSWYgYSBIZXJvIFByb2R1Y3QsIHRoZSBzdHJpbmcgdmFsdWUgb2YgdGhlIEJhY2stT2ZmIFByb2R1Y3QNCiAgICAgICAgICAgICAgICBpdGVtTm8NCiAgICAgICAgICAgICAgdHlwZTogc3RyaW5nDQogICAgICAgICAgICAgIHBhdHRlcm46IF5cZHs4fSQNCiAgICAgICAgICAgIHVwc2VsbEFyZ3VtZW50czoNCiAgICAgICAgICAgICAgZGVzY3JpcHRpb246ID4NCiAgICAgICAgICAgICAgICBJZiBhIEhlcm8gUHJvZHVjdCwgcHJvdmlkZSB0aGUgdXBzZWxsIGFyZ3VtZW50cyBhcyBzdHJpbmdzDQogICAgICAgICAgICAgICAgb3RoZXJ3aXNlIGFuIGVtcHR5IGFycmF5LiBUaGUgaXRlbXMgYXJlIHByb3ZpZGVkIGluIHRoZSBhcnJheSBpbg0KICAgICAgICAgICAgICAgIGNvcnJlY3QgcHJpb3JpdHkgb3JkZXIuDQogICAgICAgICAgICAgIHR5cGU6IGFycmF5DQogICAgICAgICAgICAgIGl0ZW1zOg0KICAgICAgICAgICAgICAgICRyZWY6ICcjL2NvbXBvbmVudHMvc2NoZW1hcy9VcHNlbGxBcmd1bWVudHMnDQogICAgICAgICAgcmVxdWlyZWQ6DQogICAgICAgICAgICAtIGl0ZW1UeXBlDQogICAgICAgICAgICAtIGl0ZW1Obw0KICAgICAgICAgICAgLSBpdGVtSWRlbnRpZmllcg0KICAgICAgICAgICAgLSBzdHJhdGVnaWNQcmljaW5nUm9sZQ0KICAgICAgICAgICAgLSBwcm90ZWN0c0hlcm8NCiAgICAgICAgICAgIC0gdXBzZWxsQXJndW1lbnRzDQogICAgSUtHRXJyb3I6DQogICAgICBkZXNjcmlwdGlvbjogQSBnZW5lcmljIGVycm9yIHJlc3BvbnNlDQogICAgICBwcm9wZXJ0aWVzOg0KICAgICAgICBzdGF0dXNDb2RlOg0KICAgICAgICAgIHR5cGU6IG51bWJlcg0KICAgICAgICBzdGF0dXNUZXh0Og0KICAgICAgICAgIHR5cGU6IHN0cmluZw0KICAgICAgcmVxdWlyZWQ6DQogICAgICAgIC0gc3RhdHVzQ29kZQ0KICAgICAgICAtIHN0YXR1c1RleHQNCiAgcmVzcG9uc2VzOg0KICAgIEJhZFJlcXVlc3Q6DQogICAgICBkZXNjcmlwdGlvbjogQSByZXF1ZXN0IHRvIHRoZSBzZXJ2ZXIgY2Fubm90IGJlIHByb2Nlc3NlZA0KICAgICAgY29udGVudDoNCiAgICAgICAgYXBwbGljYXRpb24vanNvbjoNCiAgICAgICAgICBzY2hlbWE6DQogICAgICAgICAgICAkcmVmOiAnIy9jb21wb25lbnRzL3NjaGVtYXMvSUtHRXJyb3InDQogICAgICAgICAgZXhhbXBsZToNCiAgICAgICAgICAgIHN0YXR1c0NvZGU6IDQwMA0KICAgICAgICAgICAgc3RhdHVzVGV4dDogQSByZXF1ZXN0IHRvIHRoZSBzZXJ2ZXIgY2Fubm90IGJlIHByb2Nlc3NlZA0KICAgIE5vdEF1dGhvcmlzZWQ6DQogICAgICBkZXNjcmlwdGlvbjogUmVzcG9uc2Ugd2hlbiBhIHVzZXIgaXMgbm90IGF1dGhvcmlzZWQNCiAgICAgIGNvbnRlbnQ6DQogICAgICAgIGFwcGxpY2F0aW9uL2pzb246DQogICAgICAgICAgc2NoZW1hOg0KICAgICAgICAgICAgJHJlZjogJyMvY29tcG9uZW50cy9zY2hlbWFzL0lLR0Vycm9yJw0KICAgICAgICAgIGV4YW1wbGU6DQogICAgICAgICAgICBzdGF0dXNDb2RlOiA0MDENCiAgICAgICAgICAgIHN0YXR1c1RleHQ6IFVzZXIgaXMgbm90IHBlcm1pdHRlZCB0byBhY2Nlc3MgdGhpcyByZXNvdXJjZQ0KICAgIE5vdEZvdW5kOg0KICAgICAgZGVzY3JpcHRpb246IFJlc3BvbnNlIHdoZW4gYSByZXNvdXJjZSBpcyBub3QgZm91bmQNCiAgICAgIGNvbnRlbnQ6DQogICAgICAgIGFwcGxpY2F0aW9uL2pzb246DQogICAgICAgICAgc2NoZW1hOg0KICAgICAgICAgICAgJHJlZjogJyMvY29tcG9uZW50cy9zY2hlbWFzL0lLR0Vycm9yJw0KICAgICAgICAgIGV4YW1wbGU6DQogICAgICAgICAgICBzdGF0dXNDb2RlOiA0MDQNCiAgICAgICAgICAgIHN0YXR1c1RleHQ6IFJlc291cmNlIGNhbm5vdCBiZSBmb3VuZA0KICAgIEludGVybmFsU2VydmVyRXJyb3I6DQogICAgICBkZXNjcmlwdGlvbjogQSByZXF1ZXN0IHRvIHRoZSBzZXJ2ZXIgY2Fubm90IGJlIHByb2Nlc3NlZA0KICAgICAgY29udGVudDoNCiAgICAgICAgYXBwbGljYXRpb24vanNvbjoNCiAgICAgICAgICBzY2hlbWE6DQogICAgICAgICAgICAkcmVmOiAnIy9jb21wb25lbnRzL3NjaGVtYXMvSUtHRXJyb3InDQogICAgICAgICAgZXhhbXBsZToNCiAgICAgICAgICAgIHN0YXR1c0NvZGU6IDUwMA0KICAgICAgICAgICAgc3RhdHVzVGV4dDogVXNlciBpcyBub3QgcGVybWl0dGVkIHRvIGFjY2VzcyB0aGlzIHJlc291cmNl";
		this.contractId = "1-2681AU";
		this.groupId = 212029;
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
					// Parses the REST response
					response = JSON.parse(body);
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
					// Write the error contents on the log
					console.error(error);
					// Exits the program
					process.exit(7);
				}
			}.bind(this));
		}.call(this, 0, 1));
	}
	
	/** ??????????????????? */
	getEndpointIdByName(endPointName, callback) {
		this.getEndpointByName(endPointName, ep => callback.call(this, ep ? ep.apiEndPointId : null));
	}
	
	// ==================================================================================================
	/**
	 * Create a new endpoint by importing an OpenAPI spec.
	 * 
	 * @param {Function((Object) => void)}	callback - callback that intercepts the newly created API endpoint.
	 */
	createEndpoint(callback) {
		console.log("-- Create new API definition...");
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
				callback.call(this, body);
			} else {
				// Write the error contents on the log
				console.error(error);
			}
		}.bind(this));
	}
	
	/**
	 * Updates the definition of a pre-existing API by importing an OpenAPI spec.
	 *
	 * @param {integer}						apiId			- #######################################################apiEndPointId.
	 * @param {integer}						versionNumber	- #######################################################versionNumber.
	 * @param {boolean}						upgradeVersion	- {true} to upgrade the version, or {false} to upgrade the current one.
	 * @param {Function((Object) => void)}	callback		- callback that intercepts the updated API endpoint.
	 */
	updateEndpoint(apiId, versionNumber, upgradeVersion, callback) {
		// Check whether to upgrade the API version
		if (upgradeVersion) {
			console.log(`# Creation of a new version of API ${apiId}...`);
			// Clone the latest version of the API
			this.cloneVersion(apiId, versionNumber, function(cloneVersion) {
				// Update the definition of this cloned API version
				this.editVersion(apiId, cloneVersion, callback);
			});
		} else {
			console.log(`# Updating definition of API ${apiId}...`);
			// Update the definition of the latest API version
			this.editVersion(apiId, versionNumber, callback);
		}
	}

	/**
	 * Clones the API definition by generating a new version.
	 *
	 * @param {integer}						apiId			- #######################################################apiEndPointId.
	 * @param {integer}						versionNumber	- #######################################################versionNumber.
	 *													    ~ API base version on which create the clone.
	 * @param {Function((int) => void)}	callback	- callback that intercepts the version number of the clone.
	 */
	cloneVersion(apiId, versionNumber, callback) {
		console.log(`-- Cloning of API ${apiId} version ${versionNumber} in progress...`);
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
				let cloneVersion = JSON.parse(body).versionNumber;
				console.log(`++ Cloned the API ${apiId} version ${versionNumber} (new version: ${cloneVersion}).`);
				// Invokes the callback that intercepts the value of the API clone version
				callback.call(this, cloneVersion);
			} else {
				// Write the error contents on the log
				console.error(error);
			}
		}.bind(this));
	}
	
	/**
	 * Change the definition of a certain version of an API.
	 * @param {integer}						apiId			- #######################################################apiEndPointId.
	 * @param {int}							versionNumber	- API version to be modified.
	 * @param {Function((Object) => void)}	callback		- callback that intercepts the updated API endpoint.
	 */
	editVersion(apiId, versionNumber, callback) {
		console.log(`-- Updating the API definition ${apiId} version ${versionNumber}...`);
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
				callback.call(this, JSON.parse(body));
			} else {
				// Write the error contents on the log
				console.error(error);
			}
		}.bind(this));
	}
	// ==================================================================================================
	
	adjustOpenApiSpec(callback) {
		//let environment = "Mock";
		//let input = YAML.parse(Buffer.from(this.apiContent, "base64").toString("utf8"));
		//input.servers = input.servers.filter(server => server.description.includes(environment));
		ApiSpecConverter.convert({
			source: YAML.parse(Buffer.from(this.apiContent, "base64").toString("utf8")),
			from: 'openapi_3',
			to: 'swagger_2',
		})
		.then(function(converted) {
			// ######################################
			this.apiContent = Buffer.from(converted.stringify()).toString("base64");
			// ######################################
			callback.call(this, {
				name: converted.spec.info.title,
				version: converted.spec.info.version,
				basePath: converted.spec.basePath,
				host: converted.spec.host
			})
		}.bind(this));
	}
	
	static sameMajorMinorVersion(oldVersion, newVersion) {
		const regex = /^(\d+\.\d+)/g;
		oldVersion = oldVersion.match(regex);
		newVersion = newVersion.match(regex);
		if ((Array.isArray(oldVersion) && oldVersion.length > 0) &&
		    (Array.isArray(newVersion) && newVersion.length > 0)) {
			return oldVersion[0] == newVersion[0];
		} else {
			throw SyntaxError("Invalid version syntax");
		}
	}
	// ==================================================================================================
	
	/** Application entry point. */
	main() {
		// ###########################################
		this.adjustOpenApiSpec(function(inputMetadata) {
			// ###########################################
			this.getEndpointByName(inputMetadata.name, function(endPoint) {
				// ###########################################
				if (endPoint) {
					// ###########################################
					let needUpgrade = !Application.sameMajorMinorVersion(endPoint.source.apiVersion, inputMetadata.version);
					// Updates the API definition by importing the new OpenAPI specification
					this.updateEndpoint(endPoint.apiEndPointId, endPoint.versionNumber, needUpgrade, function(endPoint) {
						// Operation successfully completed
						console.log(`++ Updated the API definition ${endPoint.apiEndPointId} version ${endPoint.versionNumber}.`);
						console.log(endPoint);
					});
				} else {
					// ###########################################
					this.createEndpoint(function(endpoint) {
						// Operation successfully completed.
						console.log("++ Created OpenAPI Spec");
					});
				}
			});
		});
/*		// Updates the API definition by importing the new OpenAPI specification
		this.updateEndpoint(true, function(endPoint) {
			// Operation successfully completed.
			console.log(`++ Updated the API definition ${this.apiEndPointId} version ${endPoint.versionNumber}.`);
			console.log(endPoint);
		});
		
		this.getEndpointByName('Back-Off to Hero - IKEA Knowledge Graph', function(endPoint) {
			 if (endPoint) {
				 console.log("HEY:", Object.filterByKeys(endPoint, 'apiEndPointId', 'versionNumber'));
			 } else {
				 console.log("NOT FOUND");
			 }
		});
*/
		/*this.getEndpointIdByName('Back-Off to Hero - IKEA Knowledge Graph', function(endPointId) {
			 if (endPointId !== null) {
				 console.log("HEY:", endPointId);
			 } else {
				 console.log("NOT FOUND");
			 }
		});*/
	}
}

/**
 * Application entry point.
 */
try {
	new Application().main();
} catch(err) {
	console.error(err)
}