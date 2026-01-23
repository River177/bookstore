// template.typ
#let project(
  title: "",
  subtitle: "",
  info: (:),
  body
) = {
  // 1. 基础页面设置
  set page(
    paper: "a4",
    margin: 2.5cm,
    numbering: "1", // 页码样式
    
    // ==================== 修复开始 ====================
    // 页眉设置 (使用 Typst 0.11+ 的 context 语法)
    header: context {
      // 获取当前页面的页码数组中的第一个数字
      let page-num = counter(page).get().first()
      
      // 逻辑判断：只要页码大于0就显示（封面通常设为header:none，不会执行这里）
      if page-num > 0 {
        set text(size: 9pt)
        align(center)[东南大学本科生实验报告]
        line(length: 100%, stroke: 0.5pt)
      }
    },
    
    // 页脚设置 (同样使用 context)
    footer: context {
      let page-num = counter(page).get().first()
      // 只有在定义了页码编号样式时才显示页脚
      // 这里的逻辑可以根据需要调整，通常正文页码大于0显示
      if page-num > 0 {
        align(center)[#page-num]
      }
    }
    // ==================== 修复结束 ====================
  )

  // 2. 字体与段落设置
  // 优先使用宋体，英文使用 Times New Roman// 优先尝试 Times New Roman，如果没有，则退化使用 Liberation Serif (类似样式)
  set text(
    font: ("Times New Roman", "SimSun"), 
    size: 12pt, 
    lang: "zh"
  )
  set par(justify: true, leading: 1em, first-line-indent: 2em)

  // 3. 标题样式设置
  set heading(numbering: "1.1")
  
  show heading.where(level: 1): it => {
    set text(size: 16pt, weight: "bold")
    v(0.5em)
    it
    v(0.5em)
  }
    
  show heading.where(level: 2): it => {
    set text(size: 14pt, weight: "bold")
    v(0.5em)
    it
    v(0.5em)
  }
    
  show heading.where(level: 3): it => {
    set text(size: 12pt, weight: "bold")
    it
    v(0.3em)
  }

  // 4. 图片和表格设置
  show figure: it => {
    set align(center)
    it
  }
  set figure(supplement: "图")

  // ================= 封面绘制 =================
  // 封面强制不显示页眉页脚
  set page(header: none, footer: none, numbering: none)
  
  align(center)[
    #v(1.3cm)
    #image("imgs/logo.png", width: 12cm) 
    
    #v(3cm)
    #text(size: 32pt, weight: "bold")[#title]
    
    #v(1cm)
    #text(size: 32pt, weight: "bold")[#subtitle]
    
    #v(2.5cm)
  ]

  // 表单信息
  let info-key(body) = {
    set align(right)
    text(size: 14pt)[#body #h(1em)]
  }
  
  let info-value(body) = {
    set align(center + bottom)
    rect(width: 100%, stroke: (bottom: 1pt, rest: 0pt))[
      #text(size: 14pt, weight: "bold")[#body]
      #v(0.2em)
    ]
  }

  align(center)[
    #grid(
      columns: (4cm, 10cm),
      row-gutter: 1.5em,
      info-key("题    目"), info-value(info.title),
      info-key("学生姓名"), info-value(info.name),
      info-key("指导教师"), info-value(info.teacher),
      info-key("实验时间"), info-value(info.date),
    )
  ]

  pagebreak()

  // ================= 目录页 =================
  set page(numbering: "i") 
  counter(page).update(1)
  
  align(center)[#text(size: 16pt, weight: "bold")[目 录]]
  v(1em)
  outline(title: none, indent: auto)

  pagebreak()

  // ================= 正文开始 =================
  set page(numbering: "1") 
  counter(page).update(1) 
  
  body
}