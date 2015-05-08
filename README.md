# Issue Lister

This web app is for listing all Issues and Pull Requests from every owned repo, which are open.

This works with both **GitHub** users and organisations. Other systems are not supported.

## setup

To use the *Issue Lister*, you only have to modify the configuration file `config.js`.
The example below is pretty self explenatory. The file has to keep it's structure.

```js
var config = {
    
    // github user (users) or organisation (orgs)
    type: 'orgs',
    
    // github name
    name: 'bullgit',
    
    // date and time format
    datetimeformat: 'DD.MM.YYYY HH:mm',
    
    // see different console.log statements
    debug: false
    
}
```

## example

Issue Lister was mainly developed for the use at @bullgit. With a bit team of people collaboratin on different projects, it is important to keep track of the Pull Requests and Issues in the differend repositories, old and new.

A public accessible *Issue Lister* is available at http://il.bullg.it.