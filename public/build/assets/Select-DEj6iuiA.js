import{j as e}from"./app-DteqDP6z.js";function u({value:d,onChange:l,options:s=[],placeholder:r="-- Pilih --",className:i="",required:o=!1,disabled:t=!1,id:g,...n}){return e.jsxs("select",{id:g,value:d,onChange:l,required:o,disabled:t,className:`
                block w-full rounded-lg border-gray-300 dark:border-gray-700/40 shadow-sm
                text-sm text-gray-700 dark:text-gray-200
                bg-white dark:bg-[#2a2a3d]
                focus:border-indigo-500 focus:ring-indigo-500
                disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed
                ${i}
            `,...n,children:[r&&e.jsx("option",{value:"",children:r}),s.map(a=>e.jsx("option",{value:a.value,children:a.label},a.value))]})}export{u as S};
