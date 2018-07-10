# SwarmChat demo app

Simple demo chat app for [Postal Services over Swarm](https://swarm-guide.readthedocs.io/en/docs-overhaul/pss.html).

## Running the demo

A version of the app is deployed to Swarm with the hash `19abdd0249735db7dcfa3b39464064173014001a1de1f3ee39022ea6a5e6868d` and can be accessed using the [Swarm gateway](http://swarm-gateways.net/bzz:/19abdd0249735db7dcfa3b39464064173014001a1de1f3ee39022ea6a5e6868d/).
More recent versions might be deployed with other hashes.

A local Swarm node with WebSocket APIs is required to connect the app.

## Development

This app is created using [Create React App](https://github.com/facebook/create-react-app), exposing the following scripts:

- `npm start` to run it locally and watch for changes.
- `npm build` to build the assets into the `build` folder.

## Publishing a new version

1.  Run `npm build` to build the app contents.
1.  Edit the `build/index.html` file to remove the leading `/` in the assets URLs, ex `/static/js/main.a60f8906.js` should be changed to `static/js/main.a60f8906.js`.
1.  Run `swarm --defaultpath ./build/index.html --recursive up ./build` to upload the contents to Swarm.
1.  Use the returned hash to access the app using the `bzz` protocol.

## License

MIT.\
See [LICENSE](../LICENSE) file.
