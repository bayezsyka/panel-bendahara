import{j as s}from"./app-DDkThiwp.js";function g({value:o,onChange:r,options:a=[],placeholder:l="-- Pilih --",className:i="",required:n=!1,disabled:t=!1,id:d,...u}){return s.jsxs("select",{id:d,value:o,onChange:r,required:n,disabled:t,className:`
                block w-full rounded-lg border-gray-300 shadow-sm
                text-sm text-gray-700
                focus:border-indigo-500 focus:ring-indigo-500
                disabled:bg-gray-100 disabled:cursor-not-allowed
                transition-colors duration-150
                ${i}
            `,...u,children:[l&&s.jsx("option",{value:"",children:l}),a.map(e=>s.jsx("option",{value:e.value,children:e.label},e.value))]})}export{g as S};
