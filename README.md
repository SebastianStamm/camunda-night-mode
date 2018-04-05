Camunda Night Mode
=================================

This Cockpit plugin adds a dark theme to Camunda Cockpit.

Built and tested against Camunda BPM version `7.9.0`.


Integrate into Camunda Webapp
-----------------------------

Copy the contents of this repository into a new directory called `nightmode` in the `app/cockpit/scripts/` folder in your Camunda webapp distribution. For the Tomcat distribution, this would be `server/apache-tomcat-X.X.XX/webapps/camunda/app/cockpit/scripts/nightmode`.

Add the following content to the `customScripts` object in the `app/cockpit/scripts/config.js` file:

```
  // …
  customScripts: {
    ngDeps: ['cockpit.nightmode'],

    deps: ['nightmode'],

    // RequreJS path definitions
    paths: {
      'nightmode': 'scripts/nightmode/index'
    }
  }
  // …
```

License
-------

Use under terms of the [Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0)
