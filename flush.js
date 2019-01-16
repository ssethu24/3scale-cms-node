const api = require('./api');
const logger = require('./logger');

async function flush() {
  this.type = ['file', 'template', 'section'];
  for (const key of this.type) {
    const results = await api.list(key);
    for (const result of results) {
      logger.info('Deleting element', { type: key, id: result.id });
      await api.delete(key, result.id);
    }
  }
}

module.exports = flush;
