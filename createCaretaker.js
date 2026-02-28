import prisma from './src/prismaClient.js';
import bcrypt from 'bcrypt';

async function main(){
  const hash = await bcrypt.hash('caretakerpass',10);
  const role = await prisma.role.findUnique({where:{name:'CARETAKER'}});
  const user = await prisma.user.create({data:{name:'Carol Caretaker',email:'carol@caretaker.com',password:hash,roleId:role.id}});
  console.log('created',user);
}

main().catch(e=>console.error(e)).finally(()=>prisma.$disconnect());