import{j as r}from"./jsx-runtime-CqWLaiLC.js";import{R as tr}from"./iframe-B7BhqHn-.js";import{c as or}from"./utils-CytzSlOG.js";import{c as v}from"./createLucideIcon-R6I7Myp-.js";import"./preload-helper-C1FmrZbK.js";const e=tr.forwardRef(({className:U,variant:Y="default",size:Z="md",icon:a,iconPosition:g="left",isLoading:h=!1,children:$,disabled:rr,...er},ar)=>{const sr={sm:"text-body-sm px-3 py-1.5",md:"text-body px-4 py-2",lg:"text-body-lg px-6 py-3"},nr={default:"orx-button",primary:"orx-button-primary",success:"bg-[var(--color-success)]/80 hover:bg-[var(--color-success)] text-[var(--inverse)]",warning:"bg-[var(--color-warning)]/80 hover:bg-[var(--color-warning)] text-[var(--inverse)]",error:"bg-[var(--color-error)]/80 hover:bg-[var(--color-error)] text-[var(--inverse)]"};return r.jsx("button",{ref:ar,className:or("inline-flex items-center justify-center gap-2","font-medium rounded-lg","transition-all duration-150","disabled:opacity-50 disabled:cursor-not-allowed",sr[Z],nr[Y],U),disabled:rr||h,...er,children:h?r.jsx("span",{className:"animate-spin",children:"⟳"}):r.jsxs(r.Fragment,{children:[a&&g==="left"&&r.jsx(a,{size:18}),$,a&&g==="right"&&r.jsx(a,{size:18})]})})});e.displayName="OraclusXButton";e.__docgenInfo={description:"",methods:[],displayName:"OraclusXButton",props:{variant:{required:!1,tsType:{name:"union",raw:'"default" |"primary" |"success" |"warning" |"error"',elements:[{name:"literal",value:'"default"'},{name:"literal",value:'"primary"'},{name:"literal",value:'"success"'},{name:"literal",value:'"warning"'},{name:"literal",value:'"error"'}]},description:"",defaultValue:{value:'"default"',computed:!1}},size:{required:!1,tsType:{name:"union",raw:'"sm" |"md" |"lg"',elements:[{name:"literal",value:'"sm"'},{name:"literal",value:'"md"'},{name:"literal",value:'"lg"'}]},description:"",defaultValue:{value:'"md"',computed:!1}},icon:{required:!1,tsType:{name:"LucideIcon"},description:""},iconPosition:{required:!1,tsType:{name:"union",raw:'"left" |"right"',elements:[{name:"literal",value:'"left"'},{name:"literal",value:'"right"'}]},description:"",defaultValue:{value:'"left"',computed:!1}},isLoading:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}}}};/**
 * @license lucide-react v0.436.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ir=v("Download",[["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["polyline",{points:"7 10 12 15 17 10",key:"2ggqvy"}],["line",{x1:"12",x2:"12",y1:"15",y2:"3",key:"1vk2je"}]]);/**
 * @license lucide-react v0.436.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const lr=v("Plus",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]]);/**
 * @license lucide-react v0.436.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const cr=v("Search",[["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["path",{d:"m21 21-4.3-4.3",key:"1qie3q"}]]);/**
 * @license lucide-react v0.436.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const dr=v("Trash2",[["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",key:"4alrt4"}],["path",{d:"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",key:"v07s0e"}],["line",{x1:"10",x2:"10",y1:"11",y2:"17",key:"1uufr5"}],["line",{x1:"14",x2:"14",y1:"11",y2:"17",key:"xtxkd"}]]),hr={title:"OraclusX DS/Button",component:e,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{variant:{control:"select",options:["default","primary","success","warning","error"],description:"Variante visual do botão"},size:{control:"select",options:["sm","md","lg"],description:"Tamanho do botão"},disabled:{control:"boolean",description:"Estado desabilitado"}}},s={args:{children:"Botão Primário",variant:"primary"}},n={args:{children:"Botão Secundário",variant:"default"}},t={args:{children:"Excluir",variant:"error"}},o={args:{children:"Cancelar",variant:"default"}},i={args:{children:r.jsxs(r.Fragment,{children:[r.jsx(cr,{className:"w-4 h-4 mr-2"}),"Buscar"]}),variant:"primary"}},l={args:{children:r.jsx(lr,{className:"w-5 h-5"}),variant:"primary",size:"md"}},c={args:{children:"Pequeno",size:"sm"}},d={args:{children:"Médio",size:"md"}},m={args:{children:"Grande",size:"lg"}},u={args:{children:"Desabilitado",disabled:!0}},p={render:()=>r.jsxs("div",{className:"flex flex-col gap-4 p-6 bg-[var(--bg-primary)] rounded-2xl neuro-raised",children:[r.jsxs("div",{className:"flex gap-3",children:[r.jsx(e,{variant:"primary",children:"Primário"}),r.jsx(e,{variant:"default",children:"Padrão"}),r.jsx(e,{variant:"error",children:"Erro"}),r.jsx(e,{variant:"success",children:"Sucesso"})]}),r.jsxs("div",{className:"flex gap-3",children:[r.jsx(e,{variant:"primary",size:"sm",children:"Pequeno"}),r.jsx(e,{variant:"primary",size:"md",children:"Médio"}),r.jsx(e,{variant:"primary",size:"lg",children:"Grande"})]}),r.jsxs("div",{className:"flex gap-3",children:[r.jsxs(e,{variant:"primary",children:[r.jsx(ir,{className:"w-4 h-4 mr-2"}),"Download"]}),r.jsxs(e,{variant:"error",children:[r.jsx(dr,{className:"w-4 h-4 mr-2"}),"Excluir"]})]})]})};var y,x,f;s.parameters={...s.parameters,docs:{...(y=s.parameters)==null?void 0:y.docs,source:{originalSource:`{
  args: {
    children: 'Botão Primário',
    variant: 'primary'
  }
}`,...(f=(x=s.parameters)==null?void 0:x.docs)==null?void 0:f.source}}};var b,j,B;n.parameters={...n.parameters,docs:{...(b=n.parameters)==null?void 0:b.docs,source:{originalSource:`{
  args: {
    children: 'Botão Secundário',
    variant: 'default'
  }
}`,...(B=(j=n.parameters)==null?void 0:j.docs)==null?void 0:B.source}}};var w,S,N;t.parameters={...t.parameters,docs:{...(w=t.parameters)==null?void 0:w.docs,source:{originalSource:`{
  args: {
    children: 'Excluir',
    variant: 'error'
  }
}`,...(N=(S=t.parameters)==null?void 0:S.docs)==null?void 0:N.source}}};var z,P,k;o.parameters={...o.parameters,docs:{...(z=o.parameters)==null?void 0:z.docs,source:{originalSource:`{
  args: {
    children: 'Cancelar',
    variant: 'default'
  }
}`,...(k=(P=o.parameters)==null?void 0:P.docs)==null?void 0:k.source}}};var q,D,M;i.parameters={...i.parameters,docs:{...(q=i.parameters)==null?void 0:q.docs,source:{originalSource:`{
  args: {
    children: <>
        <Search className="w-4 h-4 mr-2" />
        Buscar
      </>,
    variant: 'primary'
  }
}`,...(M=(D=i.parameters)==null?void 0:D.docs)==null?void 0:M.source}}};var T,E,V;l.parameters={...l.parameters,docs:{...(T=l.parameters)==null?void 0:T.docs,source:{originalSource:`{
  args: {
    children: <Plus className="w-5 h-5" />,
    variant: 'primary',
    size: 'md'
  }
}`,...(V=(E=l.parameters)==null?void 0:E.docs)==null?void 0:V.source}}};var G,O,C;c.parameters={...c.parameters,docs:{...(G=c.parameters)==null?void 0:G.docs,source:{originalSource:`{
  args: {
    children: 'Pequeno',
    size: 'sm'
  }
}`,...(C=(O=c.parameters)==null?void 0:O.docs)==null?void 0:C.source}}};var I,L,R;d.parameters={...d.parameters,docs:{...(I=d.parameters)==null?void 0:I.docs,source:{originalSource:`{
  args: {
    children: 'Médio',
    size: 'md'
  }
}`,...(R=(L=d.parameters)==null?void 0:L.docs)==null?void 0:R.source}}};var _,X,A;m.parameters={...m.parameters,docs:{...(_=m.parameters)==null?void 0:_.docs,source:{originalSource:`{
  args: {
    children: 'Grande',
    size: 'lg'
  }
}`,...(A=(X=m.parameters)==null?void 0:X.docs)==null?void 0:A.source}}};var F,H,W;u.parameters={...u.parameters,docs:{...(F=u.parameters)==null?void 0:F.docs,source:{originalSource:`{
  args: {
    children: 'Desabilitado',
    disabled: true
  }
}`,...(W=(H=u.parameters)==null?void 0:H.docs)==null?void 0:W.source}}};var J,K,Q;p.parameters={...p.parameters,docs:{...(J=p.parameters)==null?void 0:J.docs,source:{originalSource:`{
  render: () => <div className="flex flex-col gap-4 p-6 bg-[var(--bg-primary)] rounded-2xl neuro-raised">
      <div className="flex gap-3">
        <Button variant="primary">Primário</Button>
        <Button variant="default">Padrão</Button>
        <Button variant="error">Erro</Button>
        <Button variant="success">Sucesso</Button>
      </div>
      <div className="flex gap-3">
        <Button variant="primary" size="sm">Pequeno</Button>
        <Button variant="primary" size="md">Médio</Button>
        <Button variant="primary" size="lg">Grande</Button>
      </div>
      <div className="flex gap-3">
        <Button variant="primary">
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
        <Button variant="error">
          <Trash2 className="w-4 h-4 mr-2" />
          Excluir
        </Button>
      </div>
    </div>
}`,...(Q=(K=p.parameters)==null?void 0:K.docs)==null?void 0:Q.source}}};const yr=["Primary","Secondary","Danger","Ghost","WithIcon","IconOnly","Small","Medium","Large","Disabled","AllVariants"];export{p as AllVariants,t as Danger,u as Disabled,o as Ghost,l as IconOnly,m as Large,d as Medium,s as Primary,n as Secondary,c as Small,i as WithIcon,yr as __namedExportsOrder,hr as default};
