# apib-include-directive
Expand Include directive in API Blueprint

This is a part of `aglio`.
See https://github.com/danielgtaylor/aglio#including-files .

# Install
`npm install --save apib-include-directive`

# Usage
```javascript
var apibIncludeDirective = require('apib-include-directive')

var expanded = apibIncludeDirective.expand('/path/to/file.md')

var expanded = apibIncludeDirective.includeDirective('/path/to', 'file content')
```

# License

Copyright (c) 2016 Daniel G. Taylor

Copyright (c) 2017 Keisuke Minami

http://dgt.mit-license.org/
