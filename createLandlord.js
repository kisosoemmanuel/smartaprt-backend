import prisma from './src/prismaClient.js';
import bcrypt from 'bcrypt';

async function main(){
  const hash = await bcrypt.hash('landlordpass',10);
  const role = await prisma.role.findUnique({where:{name:'LANDLORD'}});
  const user = await prisma.user.create({data:{name:'Bob Landlord',email:'bob@landlord.com',password:hash,roleId:role.id}});
  console.log('created',user);
}

main().catch(e=>console.error(e)).finally(()=>prisma.$disconnect());