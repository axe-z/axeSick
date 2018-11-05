const { forwardTo } = require('prisma-binding');

const Query = {
    items:  forwardTo('db'),
    item:  forwardTo('db'),   //comme find({}) en mongo
    //items: async(parent, args, ctx, info) => await ctx.db.query.items(),
    itemsConnection: forwardTo('db'),
    me: (parent, args, ctx, info) => {
      // verifier si y a un userId dans la req (faut ecrire request, req est pas dnas les params...) du ctx
      if(!ctx.request.userId) {
        return null
      }
      return ctx.db.query.user({
        where: {
          id: ctx.request.userId
        }}, info);
    }
};

module.exports = Query;
