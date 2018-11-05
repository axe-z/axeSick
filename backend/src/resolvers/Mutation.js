const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomBytes } = require('crypto'); //poche , fonctionne en CB mais...
const { promisify } = require('util');
const { transport, makeANiceEmail } = require('../mail');

//moi qui a fait ca, pas lui
function genererUnToken(context,token){
  //genere le Cookie
   context.response.cookie('AxeToken', token, {
     httpOnly: true, //pour pas pouvoir l acced si c est pas local ( dev )
     maxAge: 1000*60*60*24*365 // 1 an
   });

}

const Mutations = {
      // createItem: (parent, {title, description, image, largeImage }, context, info) =>  {
       createItem: async(parent, args, ctx, info) =>  {
        const item = await ctx.db.mutation.createItem({ data: { ...args } }, info )
       //const item = await ctx.db.mutation.createItem({data: title, description, price, image, largeImage }, info)
       //console.log('createItem...info:', info)
       return item
     },
     updateItem:  (parent, args, ctx, info) => {
       //prendre une copy
       const updates = { ...args };
        console.log(updates)
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
     deleteItem: async(parent, args, ctx, info) =>  {
       const where = { id: args.id }
       //trouver l item
       const item = await ctx.db.query.item({ where }, `{ id, title }`)
       //trouver si ils ont la permission

       //deleter //where donne le id necessaire pour le delete
       return ctx.db.mutation.deleteItem({where}, info)
     },
     //USER
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
     signin: async(parent, {password, email}, ctx, info) => {
       //check si le email existe
       const user = await ctx.db.query.user({ where : {email: email }});
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
     signout(parent, args, ctx, info){
    //   ctx.response.clearCookie('AxeToken');
       ctx.response.clearCookie('AxeToken');
       return { message: "À la prochaine!"}
     },
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

};

module.exports = Mutations;
