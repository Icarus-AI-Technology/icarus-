import{j as e}from"./jsx-runtime-CqWLaiLC.js";import{c as d}from"./utils-CytzSlOG.js";import{C as s,a as D,b as F,c as i}from"./card-DV18pRhy.js";import"./iframe-B7BhqHn-.js";import"./preload-helper-C1FmrZbK.js";const A={sm:"max-w-screen-sm",md:"max-w-screen-md",lg:"max-w-screen-lg",xl:"max-w-screen-xl","2xl":"max-w-screen-2xl",full:"max-w-full"},J={none:"px-0",sm:"px-4",md:"px-6",lg:"px-8"};function l({children:a,className:r,maxWidth:n="xl",padding:t="md",center:m=!0}){return e.jsx("div",{className:d("w-full",A[n],J[t],m&&"mx-auto",r),children:a})}l.__docgenInfo={description:`Container Component
Wrapper responsivo para conteúdo da página`,methods:[],displayName:"Container",props:{children:{required:!0,tsType:{name:"ReactNode"},description:""},className:{required:!1,tsType:{name:"string"},description:""},maxWidth:{required:!1,tsType:{name:"union",raw:"'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'",elements:[{name:"literal",value:"'sm'"},{name:"literal",value:"'md'"},{name:"literal",value:"'lg'"},{name:"literal",value:"'xl'"},{name:"literal",value:"'2xl'"},{name:"literal",value:"'full'"}]},description:`Tamanho máximo do container
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px (padrão)
- 2xl: 1536px
- full: 100%`,defaultValue:{value:"'xl'",computed:!1}},padding:{required:!1,tsType:{name:"union",raw:"'none' | 'sm' | 'md' | 'lg'",elements:[{name:"literal",value:"'none'"},{name:"literal",value:"'sm'"},{name:"literal",value:"'md'"},{name:"literal",value:"'lg'"}]},description:`Padding horizontal
- none: 0
- sm: 1rem (16px)
- md: 1.5rem (24px) - padrão
- lg: 2rem (32px)`,defaultValue:{value:"'md'",computed:!1}},center:{required:!1,tsType:{name:"boolean"},description:"Centralizar horizontalmente",defaultValue:{value:"true",computed:!1}}}};const O={xs:"gap-2",sm:"gap-4",md:"gap-6",lg:"gap-8",xl:"gap-12"},X={start:"items-start",center:"items-center",end:"items-end",stretch:"items-stretch"},P={start:"justify-start",center:"justify-center",end:"justify-end",between:"justify-between",around:"justify-around"};function B(a){if(!a)return"grid-cols-1 md:grid-cols-2 lg:grid-cols-3";const r=[];return a.base&&r.push(`grid-cols-${a.base}`),a.sm&&r.push(`sm:grid-cols-${a.sm}`),a.md&&r.push(`md:grid-cols-${a.md}`),a.lg&&r.push(`lg:grid-cols-${a.lg}`),a.xl&&r.push(`xl:grid-cols-${a.xl}`),a["2xl"]&&r.push(`2xl:grid-cols-${a["2xl"]}`),r.join(" ")}function g({children:a,className:r,cols:n,gap:t="md",align:m="stretch",justify:h="start"}){return e.jsx("div",{className:d("grid",B(n),O[t],X[m],P[h],r),children:a})}function K(a){if(!a)return"";const r=[];return a.base&&r.push(`col-span-${a.base}`),a.sm&&r.push(`sm:col-span-${a.sm}`),a.md&&r.push(`md:col-span-${a.md}`),a.lg&&r.push(`lg:col-span-${a.lg}`),a.xl&&r.push(`xl:col-span-${a.xl}`),a["2xl"]&&r.push(`2xl:col-span-${a["2xl"]}`),r.join(" ")}function f({children:a,className:r,colSpan:n,rowSpan:t}){return e.jsx("div",{className:d(K(n),t&&`row-span-${t}`,r),children:a})}g.__docgenInfo={description:`Grid Component
Layout em grade responsivo e configurável`,methods:[],displayName:"Grid",props:{children:{required:!0,tsType:{name:"ReactNode"},description:""},className:{required:!1,tsType:{name:"string"},description:""},cols:{required:!1,tsType:{name:"signature",type:"object",raw:`{
  base?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  '2xl'?: number;
}`,signature:{properties:[{key:"base",value:{name:"number",required:!1}},{key:"sm",value:{name:"number",required:!1}},{key:"md",value:{name:"number",required:!1}},{key:"lg",value:{name:"number",required:!1}},{key:"xl",value:{name:"number",required:!1}},{key:"2xl",value:{name:"number",required:!1}}]}},description:`Número de colunas por breakpoint
Sintaxe: { sm: 1, md: 2, lg: 3, xl: 4 }`},gap:{required:!1,tsType:{name:"union",raw:"'xs' | 'sm' | 'md' | 'lg' | 'xl'",elements:[{name:"literal",value:"'xs'"},{name:"literal",value:"'sm'"},{name:"literal",value:"'md'"},{name:"literal",value:"'lg'"},{name:"literal",value:"'xl'"}]},description:`Gap entre itens (usando CSS variables)
- xs: 0.5rem (8px)
- sm: 1rem (16px)
- md: 1.5rem (24px) - padrão
- lg: 2rem (32px)
- xl: 3rem (48px)`,defaultValue:{value:"'md'",computed:!1}},align:{required:!1,tsType:{name:"union",raw:"'start' | 'center' | 'end' | 'stretch'",elements:[{name:"literal",value:"'start'"},{name:"literal",value:"'center'"},{name:"literal",value:"'end'"},{name:"literal",value:"'stretch'"}]},description:"Alinhamento vertical dos itens",defaultValue:{value:"'stretch'",computed:!1}},justify:{required:!1,tsType:{name:"union",raw:"'start' | 'center' | 'end' | 'between' | 'around'",elements:[{name:"literal",value:"'start'"},{name:"literal",value:"'center'"},{name:"literal",value:"'end'"},{name:"literal",value:"'between'"},{name:"literal",value:"'around'"}]},description:"Justificação horizontal dos itens",defaultValue:{value:"'start'",computed:!1}}}};f.__docgenInfo={description:"",methods:[],displayName:"GridItem",props:{children:{required:!0,tsType:{name:"ReactNode"},description:""},className:{required:!1,tsType:{name:"string"},description:""},colSpan:{required:!1,tsType:{name:"signature",type:"object",raw:`{
  base?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  '2xl'?: number;
}`,signature:{properties:[{key:"base",value:{name:"number",required:!1}},{key:"sm",value:{name:"number",required:!1}},{key:"md",value:{name:"number",required:!1}},{key:"lg",value:{name:"number",required:!1}},{key:"xl",value:{name:"number",required:!1}},{key:"2xl",value:{name:"number",required:!1}}]}},description:"Número de colunas que o item ocupa por breakpoint"},rowSpan:{required:!1,tsType:{name:"number"},description:"Número de linhas que o item ocupa"}}};const M={xs:"gap-2",sm:"gap-4",md:"gap-6",lg:"gap-8",xl:"gap-12"},Q={vertical:{start:"items-start",center:"items-center",end:"items-end",stretch:"items-stretch"},horizontal:{start:"items-start",center:"items-center",end:"items-end",stretch:"items-stretch"}},U={start:"justify-start",center:"justify-center",end:"justify-end",between:"justify-between",around:"justify-around"};function y({children:a,className:r,direction:n="vertical",spacing:t="md",align:m="stretch",justify:h="start",wrap:R=!1,fullWidth:L=!1}){return e.jsx("div",{className:d("flex",n==="vertical"?"flex-col":"flex-row",M[t],Q[n][m],U[h],R&&"flex-wrap",L&&"w-full",r),children:a})}function $(a){return e.jsx(y,{...a,direction:"vertical"})}function E(a){return e.jsx(y,{...a,direction:"horizontal"})}function H({className:a}){return e.jsx("div",{className:d("flex-1",a)})}const Y={horizontal:{sm:"my-2",md:"my-4",lg:"my-6"},vertical:{sm:"mx-2",md:"mx-4",lg:"mx-6"}};function v({className:a,orientation:r="horizontal",spacing:n="md"}){return e.jsx("div",{className:d("bg-[var(--border)]",r==="horizontal"?"h-[1px] w-full":"w-[1px] h-full",Y[r][n],a)})}y.__docgenInfo={description:"Stack Component (Vertical ou Horizontal)",methods:[],displayName:"Stack",props:{children:{required:!0,tsType:{name:"ReactNode"},description:""},className:{required:!1,tsType:{name:"string"},description:""},direction:{required:!1,tsType:{name:"union",raw:"'vertical' | 'horizontal'",elements:[{name:"literal",value:"'vertical'"},{name:"literal",value:"'horizontal'"}]},description:`Direção do stack
- vertical: coluna (padrão)
- horizontal: linha`,defaultValue:{value:"'vertical'",computed:!1}},spacing:{required:!1,tsType:{name:"union",raw:"'xs' | 'sm' | 'md' | 'lg' | 'xl'",elements:[{name:"literal",value:"'xs'"},{name:"literal",value:"'sm'"},{name:"literal",value:"'md'"},{name:"literal",value:"'lg'"},{name:"literal",value:"'xl'"}]},description:`Espaçamento entre itens
- xs: 0.5rem (8px)
- sm: 1rem (16px)
- md: 1.5rem (24px) - padrão
- lg: 2rem (32px)
- xl: 3rem (48px)`,defaultValue:{value:"'md'",computed:!1}},align:{required:!1,tsType:{name:"union",raw:"'start' | 'center' | 'end' | 'stretch'",elements:[{name:"literal",value:"'start'"},{name:"literal",value:"'center'"},{name:"literal",value:"'end'"},{name:"literal",value:"'stretch'"}]},description:"Alinhamento dos itens no eixo principal",defaultValue:{value:"'stretch'",computed:!1}},justify:{required:!1,tsType:{name:"union",raw:"'start' | 'center' | 'end' | 'between' | 'around'",elements:[{name:"literal",value:"'start'"},{name:"literal",value:"'center'"},{name:"literal",value:"'end'"},{name:"literal",value:"'between'"},{name:"literal",value:"'around'"}]},description:"Justificação dos itens no eixo secundário",defaultValue:{value:"'start'",computed:!1}},wrap:{required:!1,tsType:{name:"boolean"},description:"Wrap (quebrar linha quando não couber)",defaultValue:{value:"false",computed:!1}},fullWidth:{required:!1,tsType:{name:"boolean"},description:"Largura completa (100%)",defaultValue:{value:"false",computed:!1}}}};$.__docgenInfo={description:"VStack Component (Stack Vertical - atalho)",methods:[],displayName:"VStack"};E.__docgenInfo={description:"HStack Component (Stack Horizontal - atalho)",methods:[],displayName:"HStack"};H.__docgenInfo={description:`Spacer Component
Adiciona espaço flex entre elementos`,methods:[],displayName:"Spacer",props:{className:{required:!1,tsType:{name:"string"},description:""}}};v.__docgenInfo={description:"",methods:[],displayName:"Divider",props:{className:{required:!1,tsType:{name:"string"},description:""},orientation:{required:!1,tsType:{name:"union",raw:"'horizontal' | 'vertical'",elements:[{name:"literal",value:"'horizontal'"},{name:"literal",value:"'vertical'"}]},description:"Orientação do divider",defaultValue:{value:"'horizontal'",computed:!1}},spacing:{required:!1,tsType:{name:"union",raw:"'sm' | 'md' | 'lg'",elements:[{name:"literal",value:"'sm'"},{name:"literal",value:"'md'"},{name:"literal",value:"'lg'"}]},description:"Espaçamento (margin) ao redor",defaultValue:{value:"'md'",computed:!1}}}};const te={title:"Layout System/Container & Grid",component:l,parameters:{layout:"fullscreen"},tags:["autodocs"]},o={render:()=>e.jsx("div",{className:"p-6 bg-[var(--bg-primary)] min-h-screen",children:e.jsx(l,{maxWidth:"xl",padding:"md",children:e.jsxs(s,{variant:"raised",children:[e.jsx(D,{children:e.jsx(F,{children:"Container (max-width: xl)"})}),e.jsx(i,{children:e.jsx("p",{children:"Este conteúdo está dentro de um Container com largura máxima XL (1280px)."})})]})})})},c={render:()=>e.jsx("div",{className:"p-6 bg-[var(--bg-primary)] min-h-screen",children:e.jsxs(l,{maxWidth:"2xl",children:[e.jsx("h2",{className:"text-[var(--text-primary)] mb-6",style:{fontFamily:"var(--font-display)",fontSize:"0.813rem",fontWeight:700},children:"Grid Responsivo (1 → 2 → 3 → 4 colunas)"}),e.jsx(g,{cols:{base:1,sm:2,lg:3,xl:4},gap:"md",children:[1,2,3,4,5,6,7,8].map(a=>e.jsx(s,{variant:"raised",children:e.jsx(i,{className:"p-6",children:e.jsxs("p",{className:"text-center text-[var(--text-primary)]",style:{fontFamily:"var(--font-body)",fontSize:"0.813rem",fontWeight:600},children:["Item ",a]})})},a))})]})})},u={render:()=>e.jsx("div",{className:"p-6 bg-[var(--bg-primary)] min-h-screen",children:e.jsxs(l,{maxWidth:"xl",children:[e.jsx("h2",{className:"text-[var(--text-primary)] mb-6",style:{fontFamily:"var(--font-display)",fontSize:"0.813rem",fontWeight:700},children:"Grid com ColSpan"}),e.jsxs(g,{cols:{base:1,md:3},gap:"md",children:[e.jsx(f,{colSpan:{base:1,md:2},children:e.jsx(s,{variant:"raised",children:e.jsx(i,{className:"p-6 h-full flex items-center justify-center",children:e.jsx("p",{className:"text-[var(--text-primary)]",children:"Item 1 (2 colunas)"})})})}),e.jsx(f,{colSpan:{base:1,md:1},children:e.jsx(s,{variant:"raised",children:e.jsx(i,{className:"p-6 h-full flex items-center justify-center",children:e.jsx("p",{className:"text-[var(--text-primary)]",children:"Item 2 (1 coluna)"})})})}),e.jsx(f,{colSpan:{base:1,md:3},children:e.jsx(s,{variant:"raised",children:e.jsx(i,{className:"p-6 h-full flex items-center justify-center",children:e.jsx("p",{className:"text-[var(--text-primary)]",children:"Item 3 (full width)"})})})})]})]})})},p={render:()=>e.jsx("div",{className:"p-6 bg-[var(--bg-primary)] min-h-screen",children:e.jsx(l,{maxWidth:"md",children:e.jsx(s,{variant:"raised",children:e.jsx(i,{className:"p-6",children:e.jsxs($,{spacing:"md",align:"stretch",children:[e.jsx("div",{className:"p-4 neuro-inset rounded-xl",children:"Item 1"}),e.jsx("div",{className:"p-4 neuro-inset rounded-xl",children:"Item 2"}),e.jsx(v,{orientation:"horizontal",spacing:"sm"}),e.jsx("div",{className:"p-4 neuro-inset rounded-xl",children:"Item 3"}),e.jsx(H,{}),e.jsx("div",{className:"p-4 neuro-inset rounded-xl",children:"Item 4 (com Spacer acima)"})]})})})})})},x={render:()=>e.jsx("div",{className:"p-6 bg-[var(--bg-primary)] min-h-screen",children:e.jsx(l,{maxWidth:"md",children:e.jsx(s,{variant:"raised",children:e.jsx(i,{className:"p-6",children:e.jsxs(E,{spacing:"md",justify:"between",fullWidth:!0,children:[e.jsx("div",{className:"p-4 neuro-inset rounded-xl",children:"Left"}),e.jsx(v,{orientation:"vertical",spacing:"sm"}),e.jsx("div",{className:"p-4 neuro-inset rounded-xl",children:"Center"}),e.jsx(v,{orientation:"vertical",spacing:"sm"}),e.jsx("div",{className:"p-4 neuro-inset rounded-xl",children:"Right"})]})})})})})};var C,b,j;o.parameters={...o.parameters,docs:{...(C=o.parameters)==null?void 0:C.docs,source:{originalSource:`{
  render: () => <div className="p-6 bg-[var(--bg-primary)] min-h-screen">
      <Container maxWidth="xl" padding="md">
        <Card variant="raised">
          <CardHeader>
            <CardTitle>Container (max-width: xl)</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Este conteúdo está dentro de um Container com largura máxima XL (1280px).</p>
          </CardContent>
        </Card>
      </Container>
    </div>
}`,...(j=(b=o.parameters)==null?void 0:b.docs)==null?void 0:j.source}}};var N,q,w;c.parameters={...c.parameters,docs:{...(N=c.parameters)==null?void 0:N.docs,source:{originalSource:`{
  render: () => <div className="p-6 bg-[var(--bg-primary)] min-h-screen">
      <Container maxWidth="2xl">
        <h2 className="text-[var(--text-primary)] mb-6" style={{
        fontFamily: 'var(--font-display)',
        fontSize: '0.813rem',
        fontWeight: 700
      }}>
          Grid Responsivo (1 → 2 → 3 → 4 colunas)
        </h2>
        <Grid cols={{
        base: 1,
        sm: 2,
        lg: 3,
        xl: 4
      }} gap="md">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(item => <Card key={item} variant="raised">
              <CardContent className="p-6">
                <p className="text-center text-[var(--text-primary)]" style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.813rem',
              fontWeight: 600
            }}>
                  Item {item}
                </p>
              </CardContent>
            </Card>)}
        </Grid>
      </Container>
    </div>
}`,...(w=(q=c.parameters)==null?void 0:q.docs)==null?void 0:w.source}}};var S,k,I;u.parameters={...u.parameters,docs:{...(S=u.parameters)==null?void 0:S.docs,source:{originalSource:`{
  render: () => <div className="p-6 bg-[var(--bg-primary)] min-h-screen">
      <Container maxWidth="xl">
        <h2 className="text-[var(--text-primary)] mb-6" style={{
        fontFamily: 'var(--font-display)',
        fontSize: '0.813rem',
        fontWeight: 700
      }}>
          Grid com ColSpan
        </h2>
        <Grid cols={{
        base: 1,
        md: 3
      }} gap="md">
          <GridItem colSpan={{
          base: 1,
          md: 2
        }}>
            <Card variant="raised">
              <CardContent className="p-6 h-full flex items-center justify-center">
                <p className="text-[var(--text-primary)]">Item 1 (2 colunas)</p>
              </CardContent>
            </Card>
          </GridItem>
          <GridItem colSpan={{
          base: 1,
          md: 1
        }}>
            <Card variant="raised">
              <CardContent className="p-6 h-full flex items-center justify-center">
                <p className="text-[var(--text-primary)]">Item 2 (1 coluna)</p>
              </CardContent>
            </Card>
          </GridItem>
          <GridItem colSpan={{
          base: 1,
          md: 3
        }}>
            <Card variant="raised">
              <CardContent className="p-6 h-full flex items-center justify-center">
                <p className="text-[var(--text-primary)]">Item 3 (full width)</p>
              </CardContent>
            </Card>
          </GridItem>
        </Grid>
      </Container>
    </div>
}`,...(I=(k=u.parameters)==null?void 0:k.docs)==null?void 0:I.source}}};var T,G,z;p.parameters={...p.parameters,docs:{...(T=p.parameters)==null?void 0:T.docs,source:{originalSource:`{
  render: () => <div className="p-6 bg-[var(--bg-primary)] min-h-screen">
      <Container maxWidth="md">
        <Card variant="raised">
          <CardContent className="p-6">
            <VStack spacing="md" align="stretch">
              <div className="p-4 neuro-inset rounded-xl">Item 1</div>
              <div className="p-4 neuro-inset rounded-xl">Item 2</div>
              <Divider orientation="horizontal" spacing="sm" />
              <div className="p-4 neuro-inset rounded-xl">Item 3</div>
              <Spacer />
              <div className="p-4 neuro-inset rounded-xl">Item 4 (com Spacer acima)</div>
            </VStack>
          </CardContent>
        </Card>
      </Container>
    </div>
}`,...(z=(G=p.parameters)==null?void 0:G.docs)==null?void 0:z.source}}};var W,V,_;x.parameters={...x.parameters,docs:{...(W=x.parameters)==null?void 0:W.docs,source:{originalSource:`{
  render: () => <div className="p-6 bg-[var(--bg-primary)] min-h-screen">
      <Container maxWidth="md">
        <Card variant="raised">
          <CardContent className="p-6">
            <HStack spacing="md" justify="between" fullWidth>
              <div className="p-4 neuro-inset rounded-xl">Left</div>
              <Divider orientation="vertical" spacing="sm" />
              <div className="p-4 neuro-inset rounded-xl">Center</div>
              <Divider orientation="vertical" spacing="sm" />
              <div className="p-4 neuro-inset rounded-xl">Right</div>
            </HStack>
          </CardContent>
        </Card>
      </Container>
    </div>
}`,...(_=(V=x.parameters)==null?void 0:V.docs)==null?void 0:_.source}}};const se=["ContainerExample","GridResponsive","GridWithColSpan","VStackExample","HStackExample"];export{o as ContainerExample,c as GridResponsive,u as GridWithColSpan,x as HStackExample,p as VStackExample,se as __namedExportsOrder,te as default};
