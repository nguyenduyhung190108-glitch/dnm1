const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const E=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const ls={get(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){toast("Bộ nhớ trình duyệt đã đầy hoặc bị chặn")}},del(k){try{localStorage.removeItem(k)}catch(e){}}};
ls.del("fm_b");
const TONES=["#F6DCC8","#EBC7A6","#D9A77E","#C08A5F","#96653F","#6B4429"],TN=["rất sáng","sáng","trung bình","bánh mật","nâu","đậm"];
let P=ls.get("fm_p",null),W=ls.get("fm_w",[]),CL=ls.get("fm_c",[]),body=null,prod=null,prodBlob=null,R=null,chat=[],analysisStarted=false,profileConfirmed=!!(P&&P.schemaVersion===2);
let F={g:profileConfirmed&&P?.explicit?.g?P.g:null,tone:profileConfirmed&&P?.explicit?.tone?P.tone:null,under:profileConfirmed&&P?.explicit?.under?P.under:null};
function toast(m){const t=$("#toast");t.textContent=m;t.classList.add("on");clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove("on"),2800)}
function view(v){$$("main>section").forEach(s=>s.hidden=s.id!="v-"+v);$$("nav button").forEach(b=>b.classList.toggle("on",b.dataset.v==v));if(v=="closet")drawCloset();scrollTo(0,0)}
function step(n){[1,2,3].forEach(i=>{const tab=$("#d"+i),active=i==n;$("#s"+i).hidden=!active;tab.className=i<n?"done":active?"cur":"";if(active)tab.setAttribute("aria-current","step");else tab.removeAttribute("aria-current")});view("try")}
const EMPTY=t=>`<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M12 16V5m0 0-4 4m4-4 4 4M5 19h14"/></svg><span>${t}</span>`;
function shrink(file,max){return new Promise((ok,no)=>{const fr=new FileReader();fr.onerror=no;fr.onload=()=>{const i=new Image();i.onerror=no;i.onload=()=>{const r=Math.min(1,max/Math.max(i.width,i.height)),c=document.createElement("canvas");c.width=Math.round(i.width*r);c.height=Math.round(i.height*r);c.getContext("2d").drawImage(i,0,0,c.width,c.height);const url=c.toDataURL("image/jpeg",.82);c.toBlob(b=>ok({url,blob:b}),"image/jpeg",.82)};i.src=fr.result};fr.readAsDataURL(file)})}
function toBlob(d){const[h,b]=d.split(","),m=h.match(/:(.*?);/)[1],s=atob(b),a=new Uint8Array(s.length);for(let i=0;i<s.length;i++)a[i]=s.charCodeAt(i);return new Blob([a],{type:m})}
function thumb(u,max){return new Promise(ok=>{const i=new Image();i.onload=()=>{const r=Math.min(1,max/Math.max(i.width,i.height)),c=document.createElement("canvas");c.width=i.width*r;c.height=i.height*r;c.getContext("2d").drawImage(i,0,0,c.width,c.height);ok(c.toDataURL("image/jpeg",.7))};i.onerror=()=>ok(u);i.src=u})}
function seg(el,opts,key){el.innerHTML=opts.map(o=>`<button type="button" class="${F[key]==o?"on":""}">${o}</button>`).join("");el.onclick=e=>{const b=e.target.closest("button");if(b){F[key]=b.textContent;seg(el,opts,key)}}}
function drawTones(){$("#tones").innerHTML=TONES.map((c,i)=>`<button type="button" aria-label="Tông da ${TN[i]}" title="${TN[i]}" class="${F.tone==i?"on":""}" style="background:${c}" data-i="${i}"></button>`).join("")}
$("#tones").onclick=e=>{const b=e.target.closest("button");if(b){F.tone=+b.dataset.i;drawTones()}};
function drawBody(){$("#bodyPrev").innerHTML=body?`<img src="${body}" alt="Ảnh toàn thân">`:EMPTY("Ảnh toàn thân")}
function drawHist(){$("#hist").textContent=W.length?"Lịch sử: "+W.slice(0,3).map(x=>`${x.d} · ${x.w}kg${x.n?" · "+x.n:""}`).join("  |  "):""}
$("#bodyIn").onchange=async e=>{const f=e.target.files[0];if(!f)return;try{body=(await shrink(f,720)).url;drawBody()}catch(x){toast("Không đọc được ảnh này, thử ảnh JPG hoặc PNG nhé")}};
$("#prodIn").onchange=async e=>{const f=e.target.files[0];if(!f)return;try{const r=await shrink(f,900);prod=r.url;prodBlob=r.blob;drawProd()}catch(x){toast("Không đọc được ảnh này, thử ảnh JPG hoặc PNG nhé")}};
function drawProd(){$("#prodPrev").innerHTML=prod?`<img src="${prod}" alt="Ảnh sản phẩm">`:EMPTY("Chạm để tải ảnh sản phẩm")}
function saveProfile(){const n=x=>+String($(x).value).replace(",","."),h=n("#h"),w=n("#w");
if(!(h>=120&&h<=220))return toast("Chiều cao nên từ 120 đến 220 cm");if(!(w>=25&&w<=200))return toast("Cân nặng nên từ 25 đến 200 kg");
const old=P,nt=$("#note").value.trim();P={...(P||{}),...F,g:F.g??P?.g??null,tone:F.tone??P?.tone??null,under:F.under??P?.under??null,h,w,c:$("#c").value,e:$("#e").value,m:$("#m").value,explicit:{g:!!F.g,tone:F.tone!=null,under:!!F.under},schemaVersion:2};profileConfirmed=true;ls.set("fm_p",P);
if(!old||old.w!=w||nt){W.unshift({d:new Date().toLocaleDateString("vi-VN"),w,n:nt});W=W.slice(0,20);ls.set("fm_w",W);$("#note").value=""}
drawHist();return true}
$("#to2").onclick=()=>{if(saveProfile())step(2)};
$("#b1").onclick=()=>step(1);
$("#d1").onclick=()=>step(1);
$("#d2").onclick=()=>{if(saveProfile())step(2)};
$("#d3").onclick=()=>{if(R||analysisStarted)step(3);else toast("Hãy hoàn tất phân tích ở bước 2 trước nhé")};
$("#wipe").onclick=()=>{if(!confirm("Xóa hồ sơ, ảnh và tủ đồ khỏi trình duyệt này?"))return;["fm_p","fm_w","fm_c","fm_b"].forEach(ls.del);P=null;profileConfirmed=false;F={g:null,tone:null,under:null};W=[];CL=[];body=null;prod=null;prodBlob=null;R=null;chat=[];["h","w","c","e","m","note"].forEach(i=>$("#"+i).value="");seg($("#gs"),["Nữ","Nam","Unisex"],"g");seg($("#us"),["Ấm","Lạnh","Trung tính"],"under");drawTones();drawBody();drawProd();drawHist();$("#chat").innerHTML="";bubble("ai",WELCOME);toast("Đã xóa dữ liệu")};
const prof=()=>{if(!P||!profileConfirmed)return"chưa có hồ sơ đã xác nhận";const a=[];if(P.explicit?.g&&P.g)a.push(`giới tính ${P.g}`);if(P.h)a.push(`cao ${P.h}cm`);if(P.w)a.push(`nặng ${P.w}kg`);if(P.c)a.push(`ngực ${P.c}cm`);if(P.e)a.push(`eo ${P.e}cm`);if(P.m)a.push(`mông ${P.m}cm`);if(P.explicit?.tone&&P.tone!=null&&TN[P.tone])a.push(`da ${TN[P.tone]}`);if(P.explicit?.under&&P.under)a.push(`undertone ${P.under}`);return a.join(", ")||"chưa có thông tin cá nhân"};
function errMsg(x){return x?.message||"AI is unavailable right now. Please try again."}
async function callAI(path,payload){const r=await fetch(path,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||"Could not call the AI API.");return d}
function blobDataURL(blob){return new Promise((ok,no)=>{const r=new FileReader();r.onload=()=>ok(r.result);r.onerror=no;r.readAsDataURL(blob)})}
async function analyze(chart,link){
 const im=[];if(body)im.push(toBlob(body));im.push(prodBlob);
 const p=`You are a stylist and clothing-size advisor for Vietnamese users. Reply in Vietnamese and do not invent measurements.
User profile: ${prof()}.
${body?"Image 1 is the user and image 2 is the product.":"There is one image: the product."}${link?" Product link: "+link:""}
${!body&&(!profileConfirmed||!P?.explicit?.tone||!P?.explicit?.under)?"No user photo and no confirmed skin tone/undertone are provided. Do not guess whether the product color suits the user. Set color.score to 0 and explain briefly in color.verdict and color.why that personal color suitability cannot be assessed without this information.":""}
${!profileConfirmed||!P?.h||!P?.w?"No confirmed height and weight are provided. Do not claim a personalized size or fit. Set size to 'Chưa rõ', confidence to 'low', fit to an empty array, and explain in summary that measurements are needed.":""}
Shop size chart: ${chart||"(not provided; estimate using common Vietnamese sizes and set confidence to low)"}
Read the product. Compare measurements only when provided. Assess color suitability only when confirmed skin information or a user photo is available; if not, follow the missing-information instructions above.
Return only valid JSON with this shape: {"product":{"name":"","color":"","colorHex":"#RRGGBB"},"size":"S|M|L|XL...","confidence":"high|medium|low","summary":"1-2 Vietnamese sentences","fit":[{"part":"shoulder|chest|waist|hip|length","status":"v\u1eeba|ch\u1eadt|r\u1ed9ng","note":"short Vietnamese note"}],"color":{"score":0,"verdict":"Vietnamese sentence","why":"Vietnamese sentence"},"styling":["3 specific outfit suggestions in Vietnamese"]}`;
 const data=await callAI("/api/analyze",{prompt:p,images:await Promise.all(im.map(blobDataURL))});return data.result}

function load(){const m=["Đang đọc ảnh sản phẩm…","Đối chiếu với số đo của bạn…","Xem màu có hợp da bạn không…","Nghĩ cách phối đồ cho bạn…"];let i=0;$("#s3").innerHTML=`<div class="load"><div class="pulse"><svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M8.5 3 3 6l2.5 4L8 8.8V20h8V8.8l2.5 1.2L21 6l-5.5-3a3.5 3.5 0 0 1-7 0z"/></svg></div><b id="lm">${m[0]}</b><small>Thường mất 5–15 giây</small></div>`;clearInterval(load.t);load.t=setInterval(()=>{const e=$("#lm");if(e)e.textContent=m[++i%m.length]},2200)}
$("#go").onclick=async()=>{if(!prod)return toast("Hãy tải ảnh sản phẩm trước nhé");R=null;analysisStarted=true;step(3);load();
try{R=await analyze($("#chart").value.trim(),$("#link").value.trim());R.thumb=await thumb(prod,220);clearInterval(load.t);draw()}catch(x){clearInterval(load.t);$("#s3").innerHTML=`<div class="card"><h3>Chưa xong</h3>${E(errMsg(x))}</div><button class="btn" id="rt">Thử lại</button><button class="btn g" id="b2">Chọn món khác</button>`;$("#rt").onclick=()=>$("#go").click();$("#b2").onclick=()=>step(2)}};
function draw(){const r=R,cl=r.color,st={"vừa":"ok","chật":"bd","rộng":"wn"};
$("#s3").innerHTML=`<h1>Kết quả <em>cho bạn</em></h1>
<div class="card"><div class="stage">${body?`<img src="${body}" alt="Bạn">`:`<div class="nop"></div>`}<b>+</b><img src="${prod}" alt="Sản phẩm"></div></div>
<div class="card"><h3>Size gợi ý</h3><div class="size"><div class="badge">${E(r.size)}</div><div><b>${E(r.product?.name||"Sản phẩm")}</b><br><span style="color:var(--mute)">Độ tin cậy: ${E(r.confidence)}</span></div></div><p style="margin:12px 0 ${r.fit?.length?10:0}px">${E(r.summary)}</p><div class="chips">${(r.fit||[]).map(f=>`<span class="chip ${st[f.status]||"ok"}" title="${E(f.note)}">${E(f.part)}: ${E(f.status)}</span>`).join("")}</div>${(r.fit||[]).map(f=>f.note?`<small>${E(f.part)}: ${E(f.note)}</small>`:"").join("")}</div>
${cl?`<div class="card"><h3>Màu & tông da</h3><div class="size"><div class="ring" style="--p:${+cl.score||0}"><b>${+cl.score||0}</b></div><div><b>${E(cl.verdict)}</b><br><span style="color:var(--mute)">${E(cl.why)}</span></div></div></div>`:""}
${r.styling?.length?`<div class="card"><h3>Gợi ý phối đồ</h3><ul class="tips">${r.styling.map(s=>`<li>${E(s)}</li>`).join("")}</ul></div>`:""}
<div class="card vton"><b style="color:var(--ink)">Ghép ảnh lên người: sắp ra mắt</b><br>Bản này tập trung tư vấn size và màu sắc.</div>
<button class="btn" id="sv">Lưu vào tủ đồ</button><button class="btn g" id="ak">Hỏi stylist thêm</button><button class="btn g" id="nx">Thử món khác</button>`;
$("#sv").onclick=()=>{if(CL.some(x=>x.id==R.id))return toast("Món này đã có trong tủ đồ");R.id=Date.now();CL.unshift({id:R.id,name:r.product?.name||"Sản phẩm",color:r.product?.color||"",size:r.size,score:cl?.score??null,thumb:r.thumb});ls.set("fm_c",CL.slice(0,30));toast("Đã lưu vào tủ đồ")};
$("#ak").onclick=()=>{view("chat");ask("Mình nên phối món này với gì cho đẹp?")};
$("#nx").onclick=()=>{prod=null;prodBlob=null;R=null;analysisStarted=false;drawProd();step(2)}}
function drawCloset(){$("#wg").innerHTML=CL.length?`<div class="wg">${CL.map(x=>`<div class="wi"><img src="${E(x.thumb)}" alt=""><span class="sz">${E(x.size)}</span><button class="x" data-d="${x.id}" aria-label="Xóa">×</button><div><b>${E(x.name)}</b>${E(x.color)}${x.score!=null?" · hợp da "+(+x.score)+"%":""}<button class="q" data-q="${E(x.name)}">Phối đồ với món này</button></div></div>`).join("")}</div>`:`<div class="empty">Tủ đồ còn trống.<br>Thử một món rồi bấm “Lưu vào tủ đồ” nhé.</div>`}
$("#wg").onclick=e=>{const d=e.target.closest("[data-d]"),q=e.target.closest("[data-q]");if(d){CL=CL.filter(x=>x.id!=d.dataset.d);ls.set("fm_c",CL);drawCloset()}if(q){view("chat");ask("Mình muốn phối đồ với món “"+q.dataset.q+"” trong tủ đồ thì nên làm sao?")}};
function bubble(w,t){const b=document.createElement("div");b.className="b "+w;b.textContent=t;$("#chat").appendChild(b);b.scrollIntoView({block:"end",behavior:"smooth"});return b}
const WELCOME="Chào bạn, mình là FitMe AI. Bạn muốn mình tư vấn size, kiểm tra màu có hợp da không, hay gợi ý phối đồ?";
const ctx=()=>`Hồ sơ: ${prof()}.
${R?`Món vừa thử: ${R.product?.name||""} màu ${R.product?.color||""}, size gợi ý ${R.size}, độ hợp da ${R.color?.score??"?"}/100.`:""}
Tủ đồ: ${CL.map(x=>x.name+" "+x.color).join("; ")||"trống"}.`;
function missingProfileAnswer(t){const q=t.toLocaleLowerCase("vi").normalize("NFD").replace(/[\u0300-\u036f]/g,"");if(/mau nao hop da|mau nao phu hop|mau hop da|goi y mau.*da/.test(q)){const hasTone=profileConfirmed&&P?.explicit?.tone||/\b(caramel|caramel|nau|banh mat|sang|trang|toi|ngam|olive)\b/.test(q);const hasUnder=profileConfirmed&&P?.explicit?.under||/undertone\s*(la\s*)?(am|lanh|trung tinh|vang|hong|xanh)/.test(q);const missing=[];if(!hasTone)missing.push("tông da");if(!hasUnder)missing.push("undertone");if(missing.length)return`Mình chưa có thông tin ${missing.join(" và ")} của bạn nên chưa thể kết luận màu nào hợp riêng. Bạn có thể chọn ở mục Thử đồ → Vóc dáng, hoặc mô tả nhanh cho mình nhé.`}if(/mac size|size gi|voc dang|so do|dang nguoi/.test(q)&&(!profileConfirmed||!P?.h||!P?.w))return"Mình chưa có số đo để tư vấn size hoặc vóc dáng chính xác. Bạn có thể nhập chiều cao và cân nặng ở mục Thử đồ → Vóc dáng, hoặc gửi số đo ngay tại đây nhé.";return""}
async function ask(t){t=t.trim();if(!t)return;bubble("me",t);const localAnswer=missingProfileAnswer(t);if(localAnswer){bubble("ai",localAnswer);chat.push({r:"user",c:t},{r:"assistant",c:localAnswer});return}
const b=bubble("ai","");b.classList.add("typing");let h=chat.slice(-8).map(m=>({role:m.r,content:m.c}));if(h[0]?.role=="assistant")h.shift();
try{const r=await callAI("/api/chat",{messages:[...h,{role:"user",content:ctx()+"\nC\u00e2u h\u1ecfi: "+t}]});b.classList.remove("typing");b.textContent=r.text;b.scrollIntoView({block:"end"});chat.push({r:"user",c:t},{r:"assistant",c:r.text})}catch(x){b.classList.remove("typing");b.textContent=errMsg(x)}}
$("#snd").onclick=()=>{const v=$("#msg").value;$("#msg").value="";ask(v)};$("#msg").onkeydown=e=>{if(e.key=="Enter")$("#snd").click()};
$("#qs").innerHTML=["Mình mặc size gì?","Màu nào hợp da mình?","Gợi ý outfit đi cà phê","Phối với đồ có sẵn"].map(q=>`<button>${q}</button>`).join("");$("#qs").onclick=e=>{const b=e.target.closest("button");if(b)ask(b.textContent)};
bubble("ai",WELCOME);
$$("nav button").forEach(b=>b.onclick=()=>view(b.dataset.v));
seg($("#gs"),["Nữ","Nam","Unisex"],"g");seg($("#us"),["Ấm","Lạnh","Trung tính"],"under");drawTones();drawBody();drawProd();drawHist();
if(P){["h","w","c","e","m"].forEach(k=>$("#"+k).value=P[k]??"")}
step(1);
