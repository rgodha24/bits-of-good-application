# bits-of-good-application

To install dependencies:

```bash
bun install
```

to start running the app, you need to install [sstv3](https://sst.dev) and set up your aws credentials locally. 
then, make a db on mongodb atlas. copy the connection URI

run this in the terminal
```bash
sst secret set MongoURI "<YOUR_MONGO_CONNECTION_URI>"
```

finally, run `sst dev`
it should give you the live url as a .on.aws url.
