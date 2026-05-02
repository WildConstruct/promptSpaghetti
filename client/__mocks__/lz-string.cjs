const compress = input => input ?? '';
const decompress = input => input ?? '';

module.exports = {
  compress,
  decompress,
  default: {
    compress,
    decompress
  }
};
