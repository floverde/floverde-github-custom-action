fs = require 'fs'
path = require 'path'

INCLUDE = /( *)<!-- include\((.*)\) -->/gmi

# Replace the include directive with the contents of the included
# file in the input.
includeReplace = (includePath, match, spaces, filename) ->
    fullPath = path.join includePath, filename
    lines = fs.readFileSync(fullPath, 'utf-8').replace(/\r\n?/g, '\n').split('\n')
    content = spaces + lines.join "\n#{spaces}"

    # The content can itself include other files, so check those
    # as well! Beware of circular includes!
    includeDirective path.dirname(fullPath), content

# Handle the include directive, which inserts the contents of one
# file into another. We find the directive using a regular expression
# and replace it using the method above.
includeDirective = (includePath, input) ->
    input.replace INCLUDE, includeReplace.bind(this, includePath)

exports.includeDirective = includeDirective

exports.expand = (file) ->
    includeDirective path.dirname(file), fs.readFileSync(file, 'utf-8')
    
