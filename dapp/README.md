# SwarmChat demo app

Simple demo chat app for [Postal Services over Swarm](https://swarm-guide.readthedocs.io/en/latest/pss.html).

## Running the demo

A local Swarm node with WebSocket APIs is required for the app to access PSS.
The SwarmChat app assets are located in the `build` folder.
After having dowloaded/pulled the project, you can simply open the `build/index.html` file in your browser, or start a static HTTP server for it (which might be needed depending on the CORS setup of your local Swarm node).

#### Example using node (npx and serve)

```sh
npx serve -s build
```

#### Example using Python

```sh
cd build && python -m SimpleHTTPServer
```

## Development

This app is created using [Create React App](https://github.com/facebook/create-react-app). It requires [node](https://nodejs.org/en/) v8+ with npm to be installed.

The following scripts are exposed:

- `npm install` to install the dependencies (must be done first).
- `npm start` to run the app locally and watch for changes.
- `npm run-script build` to build the assets into the `build` folder.

### Publishing a new version

1.  Run `npm run-script build` to build the app contents.
1.  Edit the `build/index.html` file to remove the leading `/` in the assets URLs, ex `/static/js/main.a60f8906.js` should be changed to `static/js/main.a60f8906.js`.
1.  Run `swarm --defaultpath ./build/index.html --recursive up ./build` to upload the contents to Swarm.
1.  Use the returned hash to access the app using the `bzz` protocol.

## License

MIT.\
See [LICENSE](../LICENSE) file.
