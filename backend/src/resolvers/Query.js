const { forwardTo } = require('prisma-binding');
const { hasPermission } = require("../utils");

const Query = {
    items:  forwardTo('db'),

    item:  forwardTo('db'),   //comme find({}) en mongo

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
    },

    users: async (parent, args, ctx, info) => {
      //regarder si le user a droit de voir les users
      if (!ctx.request.userId) {
        throw new Error(`Vous devez etre inscrit`);
      }
      //voir permissions avec une fonction qui scan l array des permissions
      hasPermission(ctx.request.user, ['ADMIN','PERMISSIONUPDATE']);

      // si pas d erreur sortir tout !
        //sortir tous les Users
       return ctx.db.query.users({},info)

    },

    order: async (parent, args, ctx, info) => {
      if (!ctx.request.userId) {
        throw new Error(`Vous devez etre inscrit`);
      }
      // sortir la commande selon l id passé
      const order = await ctx.db.query.order({
        where: {
          id: args.id
        }
      },info);
      //voir le user actuel est celui qui l a fait
      const ownsOrder = order.user.id === ctx.request.userId;
      //regarder si ADMIN
      const hasPermissionToSeeOrder = ctx.request.user.permissions.includes('ADMIN');

      if(!ownsOrder || !hasPermissionToSeeOrder){
          throw new Error(`Cette commande ne vous est pas permise`);
      }
      //finir et retourné
      return order

    },
    //ORDERS page des commandes
    orders: async (parent, args, ctx, info) => {
      const userId = ctx.request.userId
      if (!userId) {
        throw new Error(`Vous devez etre inscrit`);
      }
      //regarder si ADMIN
      const hasPermissionToSeeOrder = ctx.request.user.permissions.includes('ADMIN');

      const orders = await ctx.db.query.orders({
        where: {
            user: {id: userId}
        }
      },info);

      return orders
  },
};

module.exports = Query;
