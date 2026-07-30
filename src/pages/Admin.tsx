import InfoCard from "../components/InfoCard";

import {
  useState,
  useRef
} from "react";

import {
  useNavigate
} from "react-router-dom";


import {
  Upload,
  LogOut,
  ShieldCheck,
  Database,
  CalendarDays,
  HardDrive,
  UserCheck,
} from "lucide-react";


import * as XLSX from "xlsx";


import MainLayout from "../components/layout/MainLayout";


import {
  useAuth
} from "../context/AuthContext";


import {
  salvarPlanilha
} from "../services/uploadExcelSupabase";




export default function Admin(){



const {
  login,
  isAdmin,
  logout
} = useAuth();



const navigate =
useNavigate();



const [password,setPassword] =
useState("");



const [selectedFile,setSelectedFile] =
useState<File | null>(null);



const [tipoImportacao,setTipoImportacao] =
useState("inventario");



const [loading,setLoading] =
useState(false);



const [success,setSuccess] =
useState(false);



const fileInputRef =
useRef<HTMLInputElement>(null);





function handleLogin(
e:React.FormEvent
){

e.preventDefault();


if(login(password)){

navigate("/admin");

}else{

alert("Senha incorreta");

}

}





function handleLogout(){

logout();

navigate("/");

}







function handleFileChange(
event:React.ChangeEvent<HTMLInputElement>
){


const file =
event.target.files?.[0];


if(!file)return;


setSelectedFile(file);

setSuccess(false);


}







async function handleImport(){


if(!selectedFile){

alert("Selecione um arquivo");

return;

}



try{


setLoading(true);



const buffer =
await selectedFile.arrayBuffer();



const workbook =
XLSX.read(
buffer,
{
type:"array"
}
);



console.log(
"ABAS:",
workbook.SheetNames
);





if(tipoImportacao === "inventario"){



const primeiraAba =
workbook.SheetNames[0];



const dados =
XLSX.utils.sheet_to_json(
 workbook.Sheets[primeiraAba]
);



await salvarPlanilha(
"inventario",
dados
);



}




if(tipoImportacao === "operacao"){



for(
const aba of workbook.SheetNames
){


const sheet =
workbook.Sheets[aba];



const dados =
XLSX.utils.sheet_to_json(sheet);



const nome =
aba
.normalize("NFD")
.replace(/[\u0300-\u036f]/g,"")
.toUpperCase();





if(nome === "PRODUCAO"){


await salvarPlanilha(
"producao",
dados
);


}





if(nome === "ARRASTE"){


await salvarPlanilha(
"arraste",
dados
);


}





if(nome === "MEDICAO"){


await salvarPlanilha(
"medicao",
dados
);


}




}



}



setSuccess(true);



}catch(error){


console.error(
"ERRO IMPORTAÇÃO:",
error
);


alert(
"Erro na importação"
);



}finally{


setLoading(false);


}


}
if(isAdmin){


return (

<MainLayout>


<div className="
mx-auto
w-full
max-w-6xl
px-8
py-8
">



<div className="mb-12">


<p className="
text-sm
uppercase
tracking-[5px]
text-[#50FA7B]
">

TRK FLOREST

</p>



<h1 className="
mt-2
text-4xl
font-black
text-white
">

Painel Administrativo

</h1>



<p className="
mt-4
max-w-3xl
text-lg
text-[#BDC1D6]
">

Gerencie importações de planilhas e mantenha os dados do sistema atualizados.

</p>


</div>







<div className="
grid
gap-6
sm:grid-cols-2
xl:grid-cols-4
">



<InfoCard

icon={<UserCheck size={26}/>}

titulo="Administrador"

valor="Wendell"

cor="text-[#50FA7B]"

/>




<InfoCard

icon={<Database size={26}/>}

titulo="Banco"

valor="Supabase Online"

cor="text-[#8BE9FD]"

/>




<InfoCard

icon={<HardDrive size={26}/>}

titulo="Sistema"

valor="Operacional"

cor="text-[#FFB86C]"

/>




<InfoCard

icon={<CalendarDays size={26}/>}

titulo="Arquivo"

valor={
selectedFile
?
"Carregado"
:
"--"
}

cor="text-[#F1FA8C]"

/>



</div>







<div className="
mt-10
rounded-3xl
border
border-[#44475A]
bg-[#343746]
p-8
">



<h2 className="
mb-6
text-2xl
font-bold
text-white
">

Importação de Planilhas

</h2>






<select

value={tipoImportacao}

onChange={(e)=>
setTipoImportacao(e.target.value)
}

className="
w-full
rounded-2xl
border
border-[#6272A4]
bg-[#282A36]
p-4
text-lg
font-bold
text-white
"

>


<option value="inventario">

🌳 Inventário

</option>



<option value="operacao">

🚛 Derruba / Arraste / Medição

</option>



</select>







<input

ref={fileInputRef}

type="file"

accept=".xlsx,.xls"

className="hidden"

onChange={handleFileChange}

/>







<button

onClick={() =>
fileInputRef.current?.click()
}

className="
mt-6
flex
w-full
items-center
justify-center
gap-4
rounded-3xl
border-2
border-dashed
border-[#6272A4]
bg-[#282A36]
py-10
text-xl
font-bold
text-white
hover:border-[#50FA7B]
"

>


<Upload size={26}/>


Selecionar Excel


</button>







{selectedFile && (


<div className="
mt-8
rounded-3xl
border
border-[#44475A]
bg-[#282A36]
p-8
">


<h3 className="
text-2xl
font-bold
text-white
">

{selectedFile.name}

</h3>



<p className="
mt-3
text-[#BDC1D6]
">

Arquivo pronto para importar.

</p>




<button

onClick={handleImport}

disabled={loading}

className="
mt-8
w-full
rounded-2xl
bg-[#50FA7B]
py-4
text-lg
font-bold
text-[#282A36]
disabled:opacity-50
"

>


{

loading

?

"Importando..."

:

"Importar Dados"

}



</button>



</div>


)}
{success && (
  


<div className="
mt-8
rounded-2xl
border
border-green-500
bg-green-500/10
p-6
">


<h3 className="
text-xl
font-bold
text-green-400
">

✅ Importação concluída

</h3>



<p className="
mt-2
text-[#BDC1D6]
">

Dados enviados para o Supabase com sucesso.

</p>



</div>


)}
<button
  onClick={() => navigate("/admin/usuarios")}
  className="
    mt-8
    flex
    w-full
    items-center
    justify-center
    gap-3
    rounded-2xl
    bg-[#8BE9FD]
    py-4
    text-lg
    font-bold
    text-[#282A36]
    hover:bg-cyan-300
  "
>
  <UserCheck size={22} />
  Gerenciar Usuários
</button>






<button

onClick={handleLogout}

className="
mt-8
flex
w-full
items-center
justify-center
gap-3
rounded-2xl
bg-red-500
py-4
text-lg
font-bold
text-white
hover:bg-red-600
"

>


<LogOut size={22}/>


Sair da Administração


</button>



</div>



</div>


</MainLayout>


);


}






return (


<div className="
flex
min-h-screen
items-center
justify-center
bg-[#282A36]
p-6
">



<form

onSubmit={handleLogin}

className="
w-full
max-w-md
rounded-3xl
border
border-[#44475A]
bg-[#343746]
p-10
"

>




<div className="
mb-10
text-center
">


<ShieldCheck

size={52}

className="
mx-auto
text-[#50FA7B]
"

/>




<h1 className="
mt-5
text-4xl
font-black
text-white
">

Administração

</h1>


</div>






<input

type="password"

placeholder="Digite sua senha"

value={password}

onChange={(e)=>
setPassword(e.target.value)
}

className="
w-full
rounded-2xl
border
border-[#44475A]
bg-[#282A36]
p-4
text-white
"

/>






<button

type="submit"

className="
mt-8
w-full
rounded-2xl
bg-[#50FA7B]
py-4
font-bold
text-[#282A36]
"

>

Entrar

</button>





</form>


</div>


);


}