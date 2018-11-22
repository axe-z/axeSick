const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomBytes } = require('crypto'); //poche , fonctionne en CB mais...
const { promisify } = require('util');
const { transport, makeANiceEmail } = require('../mail');
const { hasPermission } = require("../utils");
const stripe = require('../stripe');

//moi qui a fait ca, pas lui
function genererUnToken(context,token){
  //genere le Cookie
   context.response.cookie('AxeToken', token, {
     httpOnly: true, //pour pas pouvoir l acced si c est pas local ( dev )
     maxAge: 1000*60*60*24*365 // 1 an
   });

}

const Mutations = {

      // CREATEITEM  // CREATEITEM  // CREATEITEM  // CREATEITEM  // CREATEITEM  // CREATEITEM // CREATEITEM  // CREATEITEM
      createItem: async (parent, args, ctx, info) => {
        // si on va manuellement a la page /sell , verifier si userId -- fait avec le token sur index.js
        if (!ctx.request.userId) {
          throw new Error(`Vous devez etre inscrit`);
        }
        const item = await ctx.db.mutation.createItem(
          {
            data: {
              // comment on creer la relation entre item et user
              user: { connect: { id: ctx.request.userId }  },
              ...args
            }
          },
          info
        );

        return item;
      },

      // UPDATEITEM  // UPDATEITEM   // UPDATEITEM    // UPDATEITEM   // UPDATEITEM   // UPDATEITEM   // UPDATEITEM

     updateItem:  (parent, args, ctx, info) => {
       //prendre une copy
       const updates = { ...args };
        //console.log(updates)
        //enlever le ID de l updates, on veut pas le changer
        delete updates.id //enleve id de l object updater pour en bas garder l original
        /// passer la method d update ( du fichier genere das les types mutation )
        return ctx.db.mutation.updateItem({
          data: updates,
          where: {
            id: args.id
          }
        }, info) //ajouter info ,fait reference a : truc de la mutation  ici =  :item
     },

     //DELETEITEM   //DELETEITEM    //DELETEITEM    //DELETEITEM    //DELETEITEM

     deleteItem: async(parent, args, ctx, info) => {

       const where = { id: args.id }
       //trouver l item
       const item = await ctx.db.query.item({ where }, `{ id  title user { id } }`) //re†ourne   id et title
       // ajouter user  et id

       //trouver si ils ont la permission pour detruire , ou sont lui qui l ont cree.
       const ownsItem = item.user.id === ctx.request.userId;
      //  console.log(item, ownsItem)
       const hasPermissions = ctx.request.user.permissions.some(permission => ['ADMIN','ITEMDELETE'].includes(permission))
      //  console.log(hasPermissions)
       //const hasPermissions2 = ctx.request.user.permissions.some(el => ['ADMIN','ITEMDELETE'])
       //console.log(hasPermissions2)
       if(!ownsItem && !hasPermissions){
           throw new Error('vous ne pouvez pas detruire cet item sans les permissions requises')
       }
       //throw new Error('vous ne pouvez pas detruire cet item sans les permissions requises')
       //deleter //where donne le id necessaire pour le delete
       return ctx.db.mutation.deleteItem({where}, info)
     },

     // SIGNUP // SIGNUP // SIGNUP // SIGNUP // SIGNUP // SIGNUP // SIGNUP // SIGNUP  SIGNUP // SIGNUP // SIGNUP

     signup: async(parent, args, ctx, info) => {
       args.email = args.email.toLowerCase();
       //hasher le password et salter en deuxieme arg. mais pas de secret ??
       const password = await bcrypt.hash(args.password, 10);
       const user = await ctx.db.mutation.createUser({
         data: {
           ...args,
           password,  //overwrite le password the args
          permissions : { set: ['USER']}
         }
       },info);
       //creer le JWT token
       const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET )


       // le seter sur la reponse comme etant un cookie
      //  genererUnToken(ctx,token)
        //OU
       ctx.response.cookie( 'AxeToken' , token, {
         httpOnly: true, //pour pas pouvoir l acced si c est pas local ( dev )
         maxAge: 1000*60*60*24*365 // 1 an
       });
       return user;
     },

     //SIGNIN   //SIGNIN   //SIGNIN   //SIGNIN   //SIGNIN   //SIGNIN   //SIGNIN   //SIGNIN//SIGNIN   //SIGNIN   //SIGNIN

     signin: async(parent, {password, email}, ctx, info) => {
       //check si le email existe
       const user = await ctx.db.query.user({ where : { email }});
       if(!user) {
         throw new Error( `Il n'existe aucun utilisateur avec ce email ${email} `) // vu comme un err. de securite de dire ca...
       }
       //check si le password existe et est correct , compare le password donne VS celui en db (user.password)
       const valid = await bcrypt.compare(password, user.password);
       if(!valid) {
         throw new Error( `Mot de passe invalide`)
       }
       //genere le token
        const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET )
       // //faire le cookie avec le token qu on a
        //genererUnToken(ctx,token)
       //OU
       // // le seter sur la reponse comme etant un cookie
       ctx.response.cookie('AxeToken', token, {
         httpOnly: true, //pour pas pouvoir l acced si c est pas local ( dev )
         maxAge: 1000*60*60*24*365 // 1 an
       });
        //retourne le user
        return user;
     },

     //SIGNOUT   //SIGNOUT   //SIGNOUT   //SIGNOUT   //SIGNOUTT   //SIGNOUT   //SIGNOUTT   //SIGNOUT   //SIGNOUT

     signout(parent, args, ctx, info){
    //   ctx.response.clearCookie('AxeToken');
       ctx.response.clearCookie('AxeToken');
       return { message: "À la prochaine!"}
     },

     //REQUESTRESET //REQUESTRESET//REQUESTRESET//REQUESTRESET//REQUESTRESET//REQUESTRESET//REQUESTRESET

     requestReset: async (parent, args, ctx, info) => {
       // verifier si vrai user
      const user = await ctx.db.query.user({ where : {email: args.email }});
      if(!user) {
        throw new Error( `Il n'existe aucun utilisateur avec ce email ${args.email} `)
      }

       //faire un reset token et expiration pour ce user
       const randomBytesPromessifier = promisify(randomBytes);

       //const resetToken = (await promisify(randomBytes)(20)).toString('hex') //va creer un buffer qu on transforem en string
       const resetToken = (await randomBytesPromessifier(20)).toString('hex')
       const resetTokenExpiry = Date.now() + 3600000; ///(1000*60*60)

       const res = await ctx.db.mutation.updateUser({
         where: {email: args.email },
         data: {resetToken: resetToken, resetTokenExpiry: resetTokenExpiry}
       })
        //console.log(res) on veut pas ca en production !

       // lui emailer son token reseté
       const mailRes = await transport.sendMail({
         from: 'info@axe-z.com',
         to: user.email,
         subject: 'Réinitialisation de votre mot de passe AXE',
         html: makeANiceEmail(`Votre lien de réinitialisation est ici! \n\n
           <a href="${process.env.FRONTEND_URL}/reset?resetToken=${resetToken}">Réinitialisation par ici</a>`)
       })
       return {message: "un courriel a ete envoyé à votre courriel"}
     },

     //RESETPASSWORD    //RESETPASSWORD    //RESETPASSWORD   //RESETPASSWORD   //RESETPASSWORD  //RESETPASSWORD   //RESETPASSWORD

     resetPassword: async (parent, args, ctx, info) => {
       // check si password match
       if(args.password !== args.confirmPassword){
           throw new Error( `Les mots de passes ne sont pas identiques `)
       }

       //check si bon reset Token -- ceci retourne qu un user de Users [user] retourne que le premier d un arr.
       const [user] = await ctx.db.query.users({
          where : {
            resetToken: args.resetToken,
            resetTokenExpiry_gte: Date.now() - 3600000
          },
        });

       //check si resetToken est expiré
       if(!user) {
         throw new Error( `Le mot de passe temporaire invalide ou a expiré etant valide une heure`);
       }
       //hasher le nouveau password
       const password = await bcrypt.hash(args.password, 10);

      //save le nouveau password pour le user et enlever le reset token
    const updatedUser = await ctx.db.mutation.updateUser({
      where: { email: user.email },
      data: {
        password,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

       // generer le jwt
         const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET )
       //faire le nouveau cookie
       genererUnToken(ctx,token)
       // return user
       return updatedUser
     },

     //UPDATEPERMISSIONS //UPDATEPERMISSIONS //UPDATEPERMISSIONS //UPDATEPERMISSIONS

     updatePermissions: async (parent, args, ctx, info) => {
       //1-voir si user loger
       if (!ctx.request.userId) {
         throw new Error(`Vous devez etre inscrit`);
       }
       //2-query le user actuel
       const currentUser = await ctx.db.query.user({where: {id: ctx.request.userId}}, info);

       //3-voir si la permission de changer
       hasPermission(currentUser, ['ADMIN','PERMISSIONUPDATE' ])

       //4- updater les permissions // prisma   updateUser(data: UserUpdateInput!, where: UserWhereUniqueInput!): User
       return  ctx.db.mutation.updateUser({
         data: {
           permissions: { //quand on utilise uin ENUM (permissions le sont on doit passer par set:)
             set: args.permissions
           }
         },
         where: {
           id: args.userId // pourquoi on utilise pas ctx.request.userId, est qu on peut changer les autres Users aussi...
         }
       }, info);
     },

      //ADDTOCART
      addToCart:  async (parent, args, ctx, info) => {
        //1- VErifier si loguer
        const userId = ctx.request.userId;
        if (!userId) {
          throw new Error(`Vous devez etre inscrit`);
        }
        //2- query le cart du user
        const [existingCartItem] =  await ctx.db.query.cartItems({
          //cartItemS bien que cartItem est ce qu on a fait, prisma a generé pleins de methodes pour plusieurs
          where: {
            user: {id: userId},
            item: {id: args.id}
          }
        })
        //3-regarder si l item est deja dans le cart + pour augmentr de 1 ,
        if(existingCartItem) {
           console.log('item dejà de le cart')
           return ctx.db.mutation.updateCartItem({
             where: { id: existingCartItem.id},
             data: { quantity: existingCartItem.quantity + 1 }
           }, info)
        }

        //4- sinon faire nouvel item pour ce user
        return ctx.db.mutation.createCartItem({
          //le cart est juste le mix du user et de l item
          data: {
            user : {  //quand en relation === connect
              connect: {id: userId}
            },
            item: {
              connect: {id: args.id}
            }
          }
        }, info)


      },
      //REMOVEFROMCART
      removeFromCart:  async (parent, args, ctx, info) => {
        //1- VErifier si loguer
        const userId = ctx.request.userId;
        if (!userId) {
          throw new Error(`Vous devez etre inscrit`);
        }

        //2- query le cart du user
          const cartItem  =  await ctx.db.query.cartItem({
          where: {
           id: args.id
          }
        }, `{id, user { id }}`) //on veut sortir le id et le user id voir si c est eux qui on ajouter l item

        //3- verifier si un retour
        if(!cartItem) throw new Error(`Aucun item au panier`);

        //-4 verifier si il sont le owner de l item
        if(cartItem.user.id !== userId ) throw new Error(`pas le droit !`);

        //deleter
        return ctx.db.mutation.deleteCartItem({
          where: {
             id: args.id
          }
        }, info)
      },

      //CREATEORDER   //CREATEORDER   //CREATEORDER   //CREATEORDER

       createOrder: async (parent, args, ctx, info) => {
         //1- VErifier si User loguer
         const userId = ctx.request.userId;
         if (!userId) {
           throw new Error(`Vous devez etre inscrit pour faire le paiement`);
         }
         //et sortir le User et tout ce qui est associé.
        const user = await ctx.db.query.user({ where: { id: userId } },
          `{ id
            name
            email
            cart {
              id
              quantity
              item { title price id description image largeImage }}}`
        );

      console.log(user);
         //2- recalculer le total de prix ( si la personne va jouer dans le JS pour changer le prix ... )
         const amount = user.cart.reduce((acc, cartItem) => acc + cartItem.item.price * cartItem.quantity, 0)

         console.log(`on va charger ${amount}`);
         //3- creer la charge Stripe - changer le token en argent !
         const charge = await stripe.charges.create({
           amount,
           currency: "CAD",
           source: args.token // qui vient de
         });
         //console.log(charge);

         //4- Convertir les cartItems a un OrderItems, c est a dire un nouveau truc a partir du data qu on a
         const orderItems = user.cart.map(cartItem => {
           const orderItem = {
             ...cartItem.item,  //on fait une copie ici pas de reference
             quantity: cartItem.quantity,
             user: {
               connect: {
                 id: userId
               }
             }
           }
            //mais on veut pas l id qui a ete copier
           delete orderItem.id
           return orderItem
           //console.log(orderItem);
           //Array de obj qui ressemble a {
           // id: 'cjo1xkuh6dlni0a63prsvc2di',
           // name: 'Benoit Lafrance',
           // email: 'benoitlafrance@email.com',
           // cart:
           //  [ { id: 'cjodae7o2rkjp0a01sysjehnh', quantity: 1, item: [Object] },
           //    { id: 'cjoe8l2jmveqb0a013ymk80ne', quantity: 1, item: [Object] } ] }
         })

         //5- creer le Order
         const order = await ctx.db.mutation.createOrder({
           data: {
             total: charge.amount, //revient de stripe
             charge: charge.id, //si on veut voir dans stripe retracer..
             items: {
               create: orderItems //fn de prisma, va mettre l array retourné de orderItems
             },
             user: {
               connect: {
                 id: userId
               }
             },
           }
         });

         //6-faire le menage - enlever du Cart et deleter les cartItems de ce user
         const cartItemIds = user.cart.map(cartItem => cartItem.id) // prend l array des id
         //  deleteManyCartItems(where: CartItemWhereInput): BatchPayload! dans prima permet:
         await ctx.db.mutation.deleteManyCartItems({
           where: {
             id_in: cartItemIds   //genre de includes de prisma
           }
         })
         //7- retourner l order
        //  console.log(order);
          return order;
   },

};

module.exports = Mutations;
