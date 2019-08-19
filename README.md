# weleakinfo-cli
> Node utility for WeLeakInfo API

## Installation

Clone this repository and install npm dependencies:

```sh
git clone https://github.com/daehee/weleakinfo-cli.git
npm install
```

Go to WeLeakInfo.com and [register for an account](https://weleakinfo.com/register).

Generate public/private API keys from We Leak Info's [API Dashboard](https://weleakinfo.com/api/overview):

Create a `.env` file at project root with the either/both API keys:

```plaintext
WELEAKINFO_PUBLIC=XXX
WELEAKINFO_PRIVATE=XXX
```

## Usage

Launch the interactive CLI:

```sh
node lib/index.js
```

## License

MIT © [Daehee Park](https://github.com/daehee)


[npm-image]: https://badge.fury.io/js/weleakinfo.svg
[npm-url]: https://npmjs.org/package/weleakinfo
[travis-image]: https://travis-ci.com/daehee/weleakinfo.svg?branch=master
[travis-url]: https://travis-ci.com/daehee/weleakinfo
[daviddm-image]: https://david-dm.org/daehee/weleakinfo.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/daehee/weleakinfo
