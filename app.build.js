({
    'baseUrl': 'app/scripts', // relative to build/
    'name': '../vendor/almond',
    'paths': {
        'vendor': '../vendor',
        'text': '../vendor/text'
    },
    'include': ['game', '../main'],
    'out': 'dist/main.js',
    'skipModuleInsertion': true
})
