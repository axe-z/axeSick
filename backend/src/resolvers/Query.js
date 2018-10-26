const { forwardTo } = require('prisma-binding');

const Query = {
    items:  forwardTo('db')

    //items: async(parent, args, context, info) => await context.db.query.items(),

};

module.exports = Query;
