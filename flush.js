const api = require('./api');
const logger = require('./logger');

const removeTypes = ['layout', 'partial', 'page', 'file', 'section'];

async function flush() {
  this.type = ['file', 'template', 'section'];
  for (const key of this.type) {
    const results = await api.list(key);
    for (const result of results) {
      if (removeTypes.includes(result._type)) {
        logger.info('Deleting element', { type: result._type, kind: key, id: result.id });
        await api.delete(key, result.id);
      }
    }
  }
}

module.exports = flush;
