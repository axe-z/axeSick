const Mutations = {
      // createItem: (parent, {title, description, image, largeImage }, context, info) =>  {
       createItem: async(parent, args, ctx, info) =>  {
        const item = await ctx.db.mutation.createItem({ data: { ...args } }, info )
       //const item = await ctx.db.mutation.createItem({data: title, description, price, image, largeImage }, info)
       //console.log('createItem...info:', info)
       return item
     },
};

module.exports = Mutations;
