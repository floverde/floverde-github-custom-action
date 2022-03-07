apibIncludeDirective = require '../src/main'
assert = require 'assert'
path = require 'path'
fs = require 'fs'

INPUT_FILE = 'test/input.md'
OUTPUT_FILE = 'test/output.md'

describe 'expand', ->
    it 'should be function', ->
        assert.equal (typeof apibIncludeDirective.expand), 'function'
    it 'should work', ->
        output = apibIncludeDirective.expand INPUT_FILE
        assert.equal output, fs.readFileSync(OUTPUT_FILE, 'utf-8')

describe 'includeDirective', ->
    it 'should be function', ->
        assert.equal (typeof apibIncludeDirective.includeDirective), 'function'
    it 'should work', ->
        includePath = path.dirname INPUT_FILE
        input = fs.readFileSync INPUT_FILE, 'utf-8'
        output = apibIncludeDirective.includeDirective includePath, input
        assert.equal output, fs.readFileSync(OUTPUT_FILE, 'utf-8')
