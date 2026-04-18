var bo=Object.defineProperty;var wo=(e,n,t)=>n in e?bo(e,n,{enumerable:!0,configurable:!0,writable:!0,value:t}):e[n]=t;var C=(e,n,t)=>wo(e,typeof n!="symbol"?n+"":n,t);import{x as Wn,w as K}from"./MM8f50uM.js";const Jn=["mainMonsterZone","spellTrapZone","fieldZone"],Xn=["mainDeck","extraDeck"],Ar=["hand","graveyard","banished"],ko=e=>Jn.includes(e),Lo=e=>Xn.includes(e),xo=e=>e==="hand",Fo=e=>e==="graveyard",$o=e=>e==="banished",fe={names:[...Jn,...Xn,...Ar],isField:ko,isDeck:Lo,isHand:xo,isGraveyard:Fo,isBanished:$o},Po=["monster","spell","trap"],Mo=["normal","effect","ritual","pendulum"],Uo=["fusion","synchro","xyz","link"],Zo=["normal","effect","tuner","token","toon","spirit"],zo=[...Mo,...Uo,"spell","trap","token"],Vo=["normal","quick-play","continuous","field","equip","ritual"],Ho=["normal","continuous","counter"],qo=["latest","legacy"],Go=e=>`《${e.jaName}》`,Tr=e=>e.type==="monster",Ir=e=>{var n;return((n=e.monsterTypeList)==null?void 0:n.includes("effect"))??!1},jo=e=>!Ir(e),Bo=e=>{var n;return((n=e.monsterTypeList)==null?void 0:n.includes("token"))??!1},Or=e=>{var n;return((n=e.monsterTypeList)==null?void 0:n.includes("tuner"))??!1},Yo=e=>Tr(e)&&!Or(e),Ko=e=>e.frameType==="synchro",$e=e=>e.type==="spell",Wo=e=>$e(e)&&e.spellType==="normal",Jo=e=>$e(e)&&e.spellType==="quick-play",Xo=e=>$e(e)&&e.spellType==="continuous",Qo=e=>$e(e)&&e.spellType==="field",es=e=>$e(e)&&e.spellType==="equip",ns=e=>e.type==="trap",ts={spell:"魔法",monster:"モンスター",trap:"罠"},rs={normal:"通常",effect:"効果",fusion:"融合",ritual:"儀式",pendulum:"ペンデュラム",synchro:"シンクロ",xyz:"エクシーズ",link:"リンク",spell:"魔法",trap:"罠",token:"トークン"},is={field:"フィールド",normal:"通常","quick-play":"速攻",continuous:"永続",equip:"装備",ritual:"儀式"},os={normal:"通常",continuous:"永続",counter:"カウンター"};function ss(e,n,t,r){const i=[];n&&i.push(rs[n]??n),t&&i.push(is[t]??t),r&&i.push(os[r]??r);const o=ts[e]??e;return i.push(o),i.join("")}const Rr=e=>({slotIndex:(e==null?void 0:e.slotIndex)??0,position:(e==null?void 0:e.position)??"faceDown",battlePosition:e==null?void 0:e.battlePosition,placedThisTurn:(e==null?void 0:e.placedThisTurn)??!1,counters:[],activatedEffects:[],equippedTo:e==null?void 0:e.equippedTo}),as=e=>fe.isHand(e.location),cs=e=>fe.isField(e.location),us=e=>fe.isGraveyard(e.location),ls=e=>fe.isBanished(e.location),ds=e=>{var n;return((n=e.stateOnField)==null?void 0:n.position)==="faceUp"},fs=e=>{var n;return((n=e.stateOnField)==null?void 0:n.position)==="faceDown"},ps=e=>{var n;return((n=e.stateOnField)==null?void 0:n.battlePosition)==="attack"},ms=e=>{var n;return((n=e.stateOnField)==null?void 0:n.battlePosition)==="defense"},An=(e,n,t)=>({...e,location:n,stateOnField:t}),hs=(e,n)=>An(e,n),_s=(e,n,t,r,i)=>{if(!fe.isField(n))throw new Error(`Invalid location for placing on field: ${n}`);return An(e,n,Rr({slotIndex:t,position:r,battlePosition:i,placedThisTurn:!0}))},gs=(e,n)=>{if(fe.isField(n))throw new Error(`Invalid location for removing from field: ${n}`);return An(e,n,void 0)};function Ss(e,n){if(!fe.isField(e.location))throw new Error(`Card must be on the field to update state: currently in ${e.location}`);if(!e.stateOnField)throw new Error("Card has no stateOnField to update.");const t={...e.stateOnField,...n};return An(e,e.location,t)}function vs(e,n){const t=e.find(r=>r.type===n);return(t==null?void 0:t.count)??0}function Es(e,n,t){const r=e.findIndex(i=>i.type===n);if(r>=0){const i=e[r],o=Math.max(0,i.count+t);return o===0?[...e.slice(0,r),...e.slice(r+1)]:[...e.slice(0,r),{type:n,count:o},...e.slice(r+1)]}else if(t>0)return[...e,{type:n,count:t}];return e}const E={nameWithBrackets:Go,TypeJaName:ss,isMonster:Tr,isToken:Bo,isEffectMonster:Ir,isNonEffectMonster:jo,isTuner:Or,isNonTuner:Yo,isSynchro:Ko,isSpell:$e,isNormalSpell:Wo,isQuickPlaySpell:Jo,isContinuousSpell:Xo,isFieldSpell:Qo,isEquipSpell:es,isTrap:ns,Instance:{inHand:as,onField:cs,inGraveyard:us,isBanished:ls,isFaceUp:ds,isFaceDown:fs,isAttackPosition:ps,isDefensePosition:ms,moved:hs,placedOnField:_s,leavedFromField:gs,updatedState:Ss},Counter:{get:vs,update:Es}};function ys(e){const n=[...e];for(let t=n.length-1;t>0;t--){const r=Math.floor(Math.random()*(t+1));[n[t],n[r]]=[n[r],n[t]]}return n}const nn={mainMonsterZone:5,spellTrapZone:5,fieldZone:1},Nr=(e,n)=>{const t=nn[n]??1,r=new Set(e[n].map(i=>{var o;return((o=i.stateOnField)==null?void 0:o.slotIndex)??-1}));for(let i=0;i<t;i++)if(!r.has(i))return i;throw new Error(`No available slot in ${n}`)},Qn=(e,n)=>e[n].length,Cs=(e,n)=>{const t=Qn(e,"hand");return n.location==="hand"?t-1:t},As=e=>Qn(e,"mainDeck")===0,et=(e,n,t)=>Qn(e,n)>=t,Ts=(e,n=nn.mainMonsterZone)=>et(e,"mainMonsterZone",n),Is=(e,n=nn.spellTrapZone)=>et(e,"spellTrapZone",n),Dr=(e,n=nn.fieldZone)=>et(e,"fieldZone",n);function Os(e,n){for(const t of Object.keys(e)){const r=e[t].find(i=>i.instanceId===n);if(r)return r}}function tn(e,n,t,r){const i=n.location,o=e[i];if(o.findIndex(g=>g.instanceId===n.instanceId)===-1)return e;const a=fe.isField(t),c=fe.isField(i),u=a&&!c,l=!a&&c;let d;if(u){if((r==null?void 0:r.position)===void 0)throw new Error("Position must be specified when placing a card on the field.");const g=Nr(e,t);d=E.Instance.placedOnField(n,t,g,r==null?void 0:r.position,r==null?void 0:r.battlePosition)}else l?d=E.Instance.leavedFromField(n,t):a&&c&&r!==void 0?d=E.Instance.updatedState(n,r):d=E.Instance.moved(n,t);if(i===t){const g=o.map(v=>v.instanceId===n.instanceId?d:v);return{...e,[i]:g}}const p=o.filter(g=>g.instanceId!==n.instanceId);if(l&&E.isToken(n))return{...e,[i]:p};let m={...e,[i]:p,[t]:[...e[t],d]};return l&&n.type==="monster"&&(m=Ds(m,n.instanceId)),m}function Rs(e,n,t){return tn(e,n,n.location,t)}function nt(e,n=1){const t=e.mainDeck.length;if(t<n)throw new Error(`Cannot draw ${n} cards. Only ${t} cards remaining in main deck.`);let r=e;for(let i=0;i<n;i++){const o=r.mainDeck[r.mainDeck.length-1];r=tn(r,o,"hand")}return r}function br(e){return{...e,mainDeck:ys(e.mainDeck)}}function Ns(e){return Dr(e)?tn(e,e.fieldZone[0],"graveyard"):e}function Ds(e,n){let t=e;const r=e.spellTrapZone.filter(i=>{var o;return((o=i.stateOnField)==null?void 0:o.equippedTo)===n});for(const i of r)t=tn(t,i,"graveyard");return t}const Nt=8e3;function bs(e,n,t){const r=e.mainDeckCardIds.map((a,c)=>({...n(a),instanceId:`main-${c}`,location:"mainDeck",placedThisTurn:!1,counters:[]})),i=e.extraDeckCardIds.map((a,c)=>({...n(a),instanceId:`extra-${c}`,location:"extraDeck",placedThisTurn:!1,counters:[]})),o={mainDeck:r,extraDeck:i,hand:[],mainMonsterZone:[],spellTrapZone:[],fieldZone:[],graveyard:[],banished:[]};let s=t!=null&&t.skipShuffle?o:br(o);return t!=null&&t.skipInitialDraw||(s=nt(s,5)),{space:s,lp:{player:Nt,opponent:Nt},phase:"draw",turn:1,result:{isGameOver:!1},normalSummonLimit:1,normalSummonUsed:0,activatedCardIds:[],activationContexts:{},queuedEndPhaseEffectIds:[]}}function ws(e,n){return[...e,n]}const Be=["draw","standby","main1","end"],ks={draw:"ドローフェイズ",standby:"スタンバイフェイズ",main1:"メインフェイズ",end:"エンドフェイズ"},Ls=e=>ks[e],wr=e=>{const n=Be.indexOf(e);return n===-1||n===Be.length-1?"end":Be[n+1]},xs=(e,n)=>{const t=wr(e);return n!==t?{valid:!1,error:`Invalid phase transition: ${e} → ${n}. Expected: ${t}`}:{valid:!0}},Fs=e=>e==="main1",$s=e=>e==="end",Dt=["exodia","lp0","deckout","surrender"],bt=["player","opponent"];function Pe(e=[]){return{isConsistent:e.length===0,errors:e,and(n){return Pe([...this.errors,...n.errors])}}}const de=(e,n,t,r)=>{const i=[];return Number.isInteger(e)||i.push(`${r} must be an integer: ${e}`),(e<n||e>t)&&i.push(`${r} is out of bounds: ${e} (Allowed: ${n} to ${t})`),i},me=(e,n)=>{const t=e.filter(r=>r.location!==n);return t.length>0?[`${t.length} cards in ${n} have incorrect location property`]:[]};function Ps(e){const n=[];n.push(...de(e.space.mainDeck.length,0,60,"Deck size")),n.push(...de(e.space.extraDeck.length,0,15,"Extra Deck size")),n.push(...de(e.space.hand.length,0,99,"Hand size")),n.push(...de(e.space.mainMonsterZone.length,0,5,"Main Monster Zone size")),n.push(...de(e.space.spellTrapZone.length,0,5,"Spell/Trap Zone size")),n.push(...de(e.space.fieldZone.length,0,1,"Field Zone size"));const t=[...e.space.mainDeck,...e.space.extraDeck,...e.space.hand,...e.space.mainMonsterZone,...e.space.spellTrapZone,...e.space.fieldZone,...e.space.graveyard,...e.space.banished],r=t.map(s=>s.instanceId),i=r.filter((s,a)=>r.indexOf(s)!==a);i.length>0&&n.push(`Duplicate card instance IDs found: ${i.join(", ")}`);const o=t.filter(s=>!s.instanceId||!s.id);return o.length>0&&n.push(`Found ${o.length} card instances with missing IDs`),n.push(...me(e.space.mainDeck,"mainDeck")),n.push(...me(e.space.extraDeck,"extraDeck")),n.push(...me(e.space.hand,"hand")),n.push(...me(e.space.mainMonsterZone,"mainMonsterZone")),n.push(...me(e.space.spellTrapZone,"spellTrapZone")),n.push(...me(e.space.fieldZone,"fieldZone")),n.push(...me(e.space.graveyard,"graveyard")),n.push(...me(e.space.banished,"banished")),Pe(n)}function Ms(e){const n=[];return n.push(...de(e.lp.player,0,99999,"Player LP")),n.push(...de(e.lp.opponent,0,99999,"Opponent LP")),Pe(n)}function Us(e){const n=[];return Be.includes(e.phase)||n.push(`Invalid phase: ${e.phase}. Must be one of: ${Be.join(", ")}`),Pe(n)}function Zs(e){const n=[];return n.push(...de(e.turn,1,999,"Turn")),Pe(n)}function zs(e){const n=[];return e.result.isGameOver?(e.result.winner||n.push("Game is over but winner is not set"),e.result.winner&&![...bt,"draw"].includes(e.result.winner)&&n.push(`Invalid winner: ${e.result.winner}. Must be one of: ${[...bt,"draw"].join(", ")}`),e.result.reason||n.push("Game is over but reason is not set"),e.result.reason&&!Dt.includes(e.result.reason)&&n.push(`Invalid reason: ${e.result.reason}. Must be one of: ${Dt.join(", ")}`)):(e.result.winner&&n.push("Game is ongoing but winner is set"),e.result.reason&&n.push("Game is ongoing but reason is set")),Pe(n)}function Vs(e){return Ps(e).and(Ms(e)).and(Us(e)).and(Zs(e)).and(zs(e))}function Hs(e){const n=Vs(e);if(!n.isConsistent)throw new Error(`Invalid GameState:
${n.errors.join(`
`)}`)}const qs=[33396948,70903634,7902349,8124921,44519536],Gs=e=>{const n=e.space.hand.map(r=>r.id);return qs.every(r=>n.includes(r))},js=e=>Gs(e)?{isGameOver:!0,winner:"player",reason:"exodia",message:"5つのエクゾディアパーツが手札に揃いました。勝利です！"}:e.lp.player<=0?{isGameOver:!0,winner:"opponent",reason:"lp0",message:"ライフポイントが0になりました。敗北です。"}:e.lp.opponent<=0?{isGameOver:!0,winner:"player",reason:"lp0",message:"相手のライフポイントが0になりました。勝利です！"}:{isGameOver:!1},Bs=e=>{var n;return(n=e.result)!=null&&n.isGameOver?e:{...e,result:js(e)}};function Ys(e,n,t){const r=e[n]??{targets:[]};return{...e,[n]:{...r,targets:t}}}function Ks(e,n){var t;return((t=e==null?void 0:e[n])==null?void 0:t.targets)??[]}function Ws(e,n,t){const r=e[n]??{targets:[]};return{...e,[n]:{...r,paidCosts:t}}}function Js(e,n){var t;return(t=e==null?void 0:e[n])==null?void 0:t.paidCosts}function Xs(e,n){if(!(n in e))return e;const{[n]:t,...r}=e;return r}function Qs(e,n,t){const r=e[n]??{targets:[]};return{...e,[n]:{...r,calculatedDamage:t}}}function ea(e,n){var t;return(t=e==null?void 0:e[n])==null?void 0:t.calculatedDamage}function na(e,n,t){const r=e[n]??{targets:[]};return{...e,[n]:{...r,declaredInteger:t}}}function ta(e,n){var t;return(t=e==null?void 0:e[n])==null?void 0:t.declaredInteger}const _={initialize:bs,updatedActivatedCardIds:ws,assert:Hs,checkVictory:Bs,Phase:{displayName:Ls,next:wr,isMain:Fs,isEnd:$s,changeable:xs},Space:{ZONE_CAPACITY:nn,countHandExcludingSelf:Cs,isMainDeckEmpty:As,isMainMonsterZoneFull:Ts,isSpellTrapZoneFull:Is,isFieldZoneFull:Dr,findCard:Os,moveCard:tn,updateCardStateInPlace:Rs,drawCards:nt,shuffleMainDeck:br,sendExistingFieldSpellToGraveyard:Ns},ActivationContext:{setTargets:Ys,getTargets:Ks,setPaidCosts:Ws,getPaidCosts:Js,setDamage:Qs,getDamage:ea,setDeclaredInteger:na,getDeclaredInteger:ta,clear:Xs}},ra={GAME_OVER:"GAME_OVER",NOT_MAIN_PHASE:"NOT_MAIN_PHASE",CARD_NOT_FOUND:"CARD_NOT_FOUND",CARD_NOT_IN_HAND:"CARD_NOT_IN_HAND",CARD_NOT_IN_VALID_LOCATION:"CARD_NOT_IN_VALID_LOCATION",CARD_NOT_ON_FIELD:"CARD_NOT_ON_FIELD",CARD_NOT_FACE_UP:"CARD_NOT_FACE_UP",NOT_SPELL_CARD:"NOT_SPELL_CARD",NOT_SPELL_OR_TRAP_CARD:"NOT_SPELL_OR_TRAP_CARD",NOT_MONSTER_CARD:"NOT_MONSTER_CARD",SPELL_TRAP_ZONE_FULL:"SPELL_TRAP_ZONE_FULL",MONSTER_ZONE_FULL:"MONSTER_ZONE_FULL",NOT_ENOUGH_TRIBUTES:"NOT_ENOUGH_TRIBUTES",INSUFFICIENT_DECK:"INSUFFICIENT_DECK",INSUFFICIENT_COUNTERS:"INSUFFICIENT_COUNTERS",SUMMON_LIMIT_REACHED:"SUMMON_LIMIT_REACHED",QUICK_PLAY_RESTRICTION:"QUICK_PLAY_RESTRICTION",ACTIVATION_CONDITIONS_NOT_MET:"ACTIVATION_CONDITIONS_NOT_MET",NO_IGNITION_EFFECT:"NO_IGNITION_EFFECT",EFFECT_NOT_REGISTERED:"EFFECT_NOT_REGISTERED",NO_VALID_TARGET:"NO_VALID_TARGET",PHASE_TRANSITION_NOT_ALLOWED:"PHASE_TRANSITION_NOT_ALLOWED",NOT_SYNCHRO_MONSTER:"NOT_SYNCHRO_MONSTER",CARD_NOT_IN_EXTRA_DECK:"CARD_NOT_IN_EXTRA_DECK",NO_VALID_SYNCHRO_MATERIALS:"NO_VALID_SYNCHRO_MATERIALS"},ia={GAME_OVER:"ゲームは終了しています",NOT_MAIN_PHASE:"メインフェイズではありません",CARD_NOT_FOUND:"カードが見つかりません",CARD_NOT_IN_HAND:"カードが手札にありません",CARD_NOT_IN_VALID_LOCATION:"カードが有効な位置にありません",CARD_NOT_ON_FIELD:"カードがフィールドにありません",CARD_NOT_FACE_UP:"カードが表側表示ではありません",NOT_SPELL_CARD:"魔法カードではありません",NOT_SPELL_OR_TRAP_CARD:"魔法または罠カードではありません",NOT_MONSTER_CARD:"モンスターカードではありません",SPELL_TRAP_ZONE_FULL:"魔法・罠ゾーンに空きがありません",MONSTER_ZONE_FULL:"モンスターゾーンに空きがありません",NOT_ENOUGH_TRIBUTES:"リリースするモンスターが不足しています",INSUFFICIENT_DECK:"デッキのカードが不足しています",INSUFFICIENT_COUNTERS:"カウンターが不足しています",SUMMON_LIMIT_REACHED:"召喚権がありません",QUICK_PLAY_RESTRICTION:"速攻魔法はセットしたターンに発動できません",ACTIVATION_CONDITIONS_NOT_MET:"発動条件を満たしていません",NO_IGNITION_EFFECT:"このカードには起動効果がありません",EFFECT_NOT_REGISTERED:"このカードの効果が登録されていません",NO_VALID_TARGET:"対象に取れるカードが存在しません",PHASE_TRANSITION_NOT_ALLOWED:"フェイズ遷移が許可されていません",NOT_SYNCHRO_MONSTER:"シンクロモンスターではありません",CARD_NOT_IN_EXTRA_DECK:"EXデッキにありません",NO_VALID_SYNCHRO_MATERIALS:"有効なシンクロ素材がありません"},oa=()=>({isValid:!0}),sa=(e,n)=>({isValid:!1,errorCode:e,errorParams:n}),aa=e=>{if(e.isValid||!e.errorCode)return"";const n=ia[e.errorCode];return e.errorParams,n},ca=(e,n,t)=>({success:!0,updatedState:_.checkVictory(e),message:n,emittedEvents:t}),ua=(e,n)=>({success:!1,updatedState:e,error:n});function la(){return{current:{timestamp:0,events:[]},history:[],nextTimestamp:1}}function kr(e){return{timestamp:e,events:[]}}function da(e,n){return{...e,current:{...e.current,events:[...e.current.events,n]}}}function fa(e){return e.current.events.length===0?e:{current:kr(e.nextTimestamp),history:[...e.history,e.current],nextTimestamp:e.nextTimestamp+1}}function pa(e){return e.current.events.length>0}function ma(e){return e.current.events}function ha(e,n){return e.current.events.some(t=>t.type===n)}function _a(e){return{...e,history:[]}}function ga(e,n){if(!e.cardSelectionConfig)return null;const t=e.cardSelectionConfig(n);if(!t)return null;let r;if(t.availableCards!==null)r=t.availableCards;else{if(!t._sourceZone)throw new Error(`[resolveCardSelection] _sourceZone must be specified when availableCards is null (step: ${e.id})`);const i=n.space[t._sourceZone],o=t._effectId?n.activationContexts[t._effectId]:void 0;r=t._filter?i.filter((s,a)=>t._filter(s,a,o,i)):i}return{config:t,availableCards:r}}const f={Validation:{ERROR_CODES:ra,success:oa,failure:sa,errorMessage:aa},Result:{success:ca,failure:ua},TimeLine:{createEmptyTimeline:la,createEmptySnapshot:kr,recordEvent:da,advanceTime:fa,hasCurrentEvents:pa,getCurrentEvents:ma,hasEventOfType:ha,clearHistory:_a},AtomicStep:{resolveCardSelection:ga}},Sa=(e,n,t,r,i)=>({success:!0,updatedState:_.checkVictory(e),message:n,emittedEvents:t,activationSteps:r??[],chainBlock:i}),va=(e,n)=>({success:!1,updatedState:e,error:n,activationSteps:[]}),ne={Result:{success:Sa,failure:va}};class Ea{constructor(){C(this,"description");this.description="Advance to next phase"}canExecute(n){if(n.result.isGameOver)return f.Validation.failure(f.Validation.ERROR_CODES.GAME_OVER);const t=_.Phase.next(n.phase);return _.Phase.changeable(n.phase,t).valid?f.Validation.success():f.Validation.failure(f.Validation.ERROR_CODES.PHASE_TRANSITION_NOT_ALLOWED)}execute(n){const t=this.canExecute(n);if(!t.isValid)return ne.Result.failure(n,f.Validation.errorMessage(t));const r=_.Phase.next(n.phase),i=_.Phase.isEnd(r)&&n.queuedEndPhaseEffectIds.length>0,o=_.Phase.isEnd(r)?this.resetFieldCardActivatedEffects(n.space):n.space,s={...n,space:o,phase:r,activatedCardIds:_.Phase.isEnd(r)?[]:n.activatedCardIds,queuedEndPhaseEffectIds:i?[]:n.queuedEndPhaseEffectIds};return ne.Result.success(s,`${_.Phase.displayName(r)} です`)}getNextPhase(n){return _.Phase.next(n.phase)}resetFieldCardActivatedEffects(n){const t=r=>{if(!r.stateOnField||r.stateOnField.activatedEffects.length===0)return r;const i={...r.stateOnField,activatedEffects:[]};return{...r,stateOnField:i}};return{...n,mainMonsterZone:n.mainMonsterZone.map(t),spellTrapZone:n.spellTrapZone.map(t),fieldZone:n.fieldZone.map(t)}}}const ya=["spellActivated","normalSummoned","specialSummoned","synchroSummoned","cardDestroyed","sentToGraveyard","monsterSentToGraveyard"],ue={sentToGraveyard(e){const n={sourceCardId:e.id,sourceInstanceId:e.instanceId,sourceInstanceLocation:e.location},t=[{type:"sentToGraveyard",...n}];return e.type==="monster"&&t.push({type:"monsterSentToGraveyard",...n}),t},specialSummoned(e){return{type:"specialSummoned",sourceCardId:e.id,sourceInstanceId:e.instanceId}},normalSummoned(e){return{type:"normalSummoned",sourceCardId:e.id,sourceInstanceId:e.instanceId}},spellActivated(e){return{type:"spellActivated",sourceCardId:e.id,sourceInstanceId:e.instanceId}},synchroSummoned(e){return{type:"synchroSummoned",sourceCardId:e.id,sourceInstanceId:e.instanceId}}};function Ca(e){return{id:`emit-spell-activated-${e.instanceId}`,summary:"魔法発動イベント",description:"魔法カード発動をトリガーシステムに通知",notificationLevel:"silent",action:n=>f.Result.success(n,void 0,[ue.spellActivated(e)])}}function Aa(e){return{id:`emit-monster-summoned-${e.instanceId}`,summary:"モンスター召喚イベント",description:"モンスター召喚をトリガーシステムに通知",notificationLevel:"silent",action:n=>f.Result.success(n,void 0,[ue.normalSummoned(e)])}}function h(e,n,t){function r(a,c){if(a._zod||Object.defineProperty(a,"_zod",{value:{def:c,constr:s,traits:new Set},enumerable:!1}),a._zod.traits.has(e))return;a._zod.traits.add(e),n(a,c);const u=s.prototype,l=Object.keys(u);for(let d=0;d<l.length;d++){const p=l[d];p in a||(a[p]=u[p].bind(a))}}const i=(t==null?void 0:t.Parent)??Object;class o extends i{}Object.defineProperty(o,"name",{value:e});function s(a){var c;const u=t!=null&&t.Parent?new o:this;r(u,a),(c=u._zod).deferred??(c.deferred=[]);for(const l of u._zod.deferred)l();return u}return Object.defineProperty(s,"init",{value:r}),Object.defineProperty(s,Symbol.hasInstance,{value:a=>{var c,u;return t!=null&&t.Parent&&a instanceof t.Parent?!0:(u=(c=a==null?void 0:a._zod)==null?void 0:c.traits)==null?void 0:u.has(e)}}),Object.defineProperty(s,"name",{value:e}),s}class be extends Error{constructor(){super("Encountered Promise during synchronous parse. Use .parseAsync() instead.")}}class Lr extends Error{constructor(n){super(`Encountered unidirectional transform during encode: ${n}`),this.name="ZodEncodeError"}}const xr={};function _e(e){return xr}function Fr(e){const n=Object.values(e).filter(r=>typeof r=="number");return Object.entries(e).filter(([r,i])=>n.indexOf(+r)===-1).map(([r,i])=>i)}function Un(e,n){return typeof n=="bigint"?n.toString():n}function tt(e){return{get value(){{const n=e();return Object.defineProperty(this,"value",{value:n}),n}}}}function rt(e){return e==null}function it(e){const n=e.startsWith("^")?1:0,t=e.endsWith("$")?e.length-1:e.length;return e.slice(n,t)}function Ta(e,n){const t=(e.toString().split(".")[1]||"").length,r=n.toString();let i=(r.split(".")[1]||"").length;if(i===0&&/\d?e-\d?/.test(r)){const c=r.match(/\d?e-(\d?)/);c!=null&&c[1]&&(i=Number.parseInt(c[1]))}const o=t>i?t:i,s=Number.parseInt(e.toFixed(o).replace(".","")),a=Number.parseInt(n.toFixed(o).replace(".",""));return s%a/10**o}const wt=Symbol("evaluating");function D(e,n,t){let r;Object.defineProperty(e,n,{get(){if(r!==wt)return r===void 0&&(r=wt,r=t()),r},set(i){Object.defineProperty(e,n,{value:i})},configurable:!0})}function Ce(e,n,t){Object.defineProperty(e,n,{value:t,writable:!0,enumerable:!0,configurable:!0})}function ve(...e){const n={};for(const t of e){const r=Object.getOwnPropertyDescriptors(t);Object.assign(n,r)}return Object.defineProperties({},n)}function kt(e){return JSON.stringify(e)}function Ia(e){return e.toLowerCase().trim().replace(/[^\w\s-]/g,"").replace(/[\s_-]+/g,"-").replace(/^-+|-+$/g,"")}const $r="captureStackTrace"in Error?Error.captureStackTrace:(...e)=>{};function fn(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}const Oa=tt(()=>{var e;if(typeof navigator<"u"&&((e=navigator==null?void 0:navigator.userAgent)!=null&&e.includes("Cloudflare")))return!1;try{const n=Function;return new n(""),!0}catch{return!1}});function we(e){if(fn(e)===!1)return!1;const n=e.constructor;if(n===void 0||typeof n!="function")return!0;const t=n.prototype;return!(fn(t)===!1||Object.prototype.hasOwnProperty.call(t,"isPrototypeOf")===!1)}function Pr(e){return we(e)?{...e}:Array.isArray(e)?[...e]:e}const Ra=new Set(["string","number","symbol"]);function ke(e){return e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function Ee(e,n,t){const r=new e._zod.constr(n??e._zod.def);return(!n||t!=null&&t.parent)&&(r._zod.parent=e),r}function I(e){const n=e;if(!n)return{};if(typeof n=="string")return{error:()=>n};if((n==null?void 0:n.message)!==void 0){if((n==null?void 0:n.error)!==void 0)throw new Error("Cannot specify both `message` and `error` params");n.error=n.message}return delete n.message,typeof n.error=="string"?{...n,error:()=>n.error}:n}function Na(e){return Object.keys(e).filter(n=>e[n]._zod.optin==="optional"&&e[n]._zod.optout==="optional")}const Da={safeint:[Number.MIN_SAFE_INTEGER,Number.MAX_SAFE_INTEGER],int32:[-2147483648,2147483647],uint32:[0,4294967295],float32:[-34028234663852886e22,34028234663852886e22],float64:[-Number.MAX_VALUE,Number.MAX_VALUE]};function ba(e,n){const t=e._zod.def,r=t.checks;if(r&&r.length>0)throw new Error(".pick() cannot be used on object schemas containing refinements");const o=ve(e._zod.def,{get shape(){const s={};for(const a in n){if(!(a in t.shape))throw new Error(`Unrecognized key: "${a}"`);n[a]&&(s[a]=t.shape[a])}return Ce(this,"shape",s),s},checks:[]});return Ee(e,o)}function wa(e,n){const t=e._zod.def,r=t.checks;if(r&&r.length>0)throw new Error(".omit() cannot be used on object schemas containing refinements");const o=ve(e._zod.def,{get shape(){const s={...e._zod.def.shape};for(const a in n){if(!(a in t.shape))throw new Error(`Unrecognized key: "${a}"`);n[a]&&delete s[a]}return Ce(this,"shape",s),s},checks:[]});return Ee(e,o)}function ka(e,n){if(!we(n))throw new Error("Invalid input to extend: expected a plain object");const t=e._zod.def.checks;if(t&&t.length>0){const o=e._zod.def.shape;for(const s in n)if(Object.getOwnPropertyDescriptor(o,s)!==void 0)throw new Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.")}const i=ve(e._zod.def,{get shape(){const o={...e._zod.def.shape,...n};return Ce(this,"shape",o),o}});return Ee(e,i)}function La(e,n){if(!we(n))throw new Error("Invalid input to safeExtend: expected a plain object");const t=ve(e._zod.def,{get shape(){const r={...e._zod.def.shape,...n};return Ce(this,"shape",r),r}});return Ee(e,t)}function xa(e,n){const t=ve(e._zod.def,{get shape(){const r={...e._zod.def.shape,...n._zod.def.shape};return Ce(this,"shape",r),r},get catchall(){return n._zod.def.catchall},checks:[]});return Ee(e,t)}function Fa(e,n,t){const i=n._zod.def.checks;if(i&&i.length>0)throw new Error(".partial() cannot be used on object schemas containing refinements");const s=ve(n._zod.def,{get shape(){const a=n._zod.def.shape,c={...a};if(t)for(const u in t){if(!(u in a))throw new Error(`Unrecognized key: "${u}"`);t[u]&&(c[u]=e?new e({type:"optional",innerType:a[u]}):a[u])}else for(const u in a)c[u]=e?new e({type:"optional",innerType:a[u]}):a[u];return Ce(this,"shape",c),c},checks:[]});return Ee(n,s)}function $a(e,n,t){const r=ve(n._zod.def,{get shape(){const i=n._zod.def.shape,o={...i};if(t)for(const s in t){if(!(s in o))throw new Error(`Unrecognized key: "${s}"`);t[s]&&(o[s]=new e({type:"nonoptional",innerType:i[s]}))}else for(const s in i)o[s]=new e({type:"nonoptional",innerType:i[s]});return Ce(this,"shape",o),o}});return Ee(n,r)}function Oe(e,n=0){var t;if(e.aborted===!0)return!0;for(let r=n;r<e.issues.length;r++)if(((t=e.issues[r])==null?void 0:t.continue)!==!0)return!0;return!1}function Re(e,n){return n.map(t=>{var r;return(r=t).path??(r.path=[]),t.path.unshift(e),t})}function sn(e){return typeof e=="string"?e:e==null?void 0:e.message}function ge(e,n,t){var i,o,s,a,c,u;const r={...e,path:e.path??[]};if(!e.message){const l=sn((s=(o=(i=e.inst)==null?void 0:i._zod.def)==null?void 0:o.error)==null?void 0:s.call(o,e))??sn((a=n==null?void 0:n.error)==null?void 0:a.call(n,e))??sn((c=t.customError)==null?void 0:c.call(t,e))??sn((u=t.localeError)==null?void 0:u.call(t,e))??"Invalid input";r.message=l}return delete r.inst,delete r.continue,n!=null&&n.reportInput||delete r.input,r}function ot(e){return Array.isArray(e)?"array":typeof e=="string"?"string":"unknown"}function Ke(...e){const[n,t,r]=e;return typeof n=="string"?{message:n,code:"custom",input:t,inst:r}:{...n}}const Mr=(e,n)=>{e.name="$ZodError",Object.defineProperty(e,"_zod",{value:e._zod,enumerable:!1}),Object.defineProperty(e,"issues",{value:n,enumerable:!1}),e.message=JSON.stringify(n,Un,2),Object.defineProperty(e,"toString",{value:()=>e.message,enumerable:!1})},Ur=h("$ZodError",Mr),Zr=h("$ZodError",Mr,{Parent:Error});function Pa(e,n=t=>t.message){const t={},r=[];for(const i of e.issues)i.path.length>0?(t[i.path[0]]=t[i.path[0]]||[],t[i.path[0]].push(n(i))):r.push(n(i));return{formErrors:r,fieldErrors:t}}function Ma(e,n=t=>t.message){const t={_errors:[]},r=i=>{for(const o of i.issues)if(o.code==="invalid_union"&&o.errors.length)o.errors.map(s=>r({issues:s}));else if(o.code==="invalid_key")r({issues:o.issues});else if(o.code==="invalid_element")r({issues:o.issues});else if(o.path.length===0)t._errors.push(n(o));else{let s=t,a=0;for(;a<o.path.length;){const c=o.path[a];a===o.path.length-1?(s[c]=s[c]||{_errors:[]},s[c]._errors.push(n(o))):s[c]=s[c]||{_errors:[]},s=s[c],a++}}};return r(e),t}const st=e=>(n,t,r,i)=>{const o=r?Object.assign(r,{async:!1}):{async:!1},s=n._zod.run({value:t,issues:[]},o);if(s instanceof Promise)throw new be;if(s.issues.length){const a=new((i==null?void 0:i.Err)??e)(s.issues.map(c=>ge(c,o,_e())));throw $r(a,i==null?void 0:i.callee),a}return s.value},at=e=>async(n,t,r,i)=>{const o=r?Object.assign(r,{async:!0}):{async:!0};let s=n._zod.run({value:t,issues:[]},o);if(s instanceof Promise&&(s=await s),s.issues.length){const a=new((i==null?void 0:i.Err)??e)(s.issues.map(c=>ge(c,o,_e())));throw $r(a,i==null?void 0:i.callee),a}return s.value},Tn=e=>(n,t,r)=>{const i=r?{...r,async:!1}:{async:!1},o=n._zod.run({value:t,issues:[]},i);if(o instanceof Promise)throw new be;return o.issues.length?{success:!1,error:new(e??Ur)(o.issues.map(s=>ge(s,i,_e())))}:{success:!0,data:o.value}},Ua=Tn(Zr),In=e=>async(n,t,r)=>{const i=r?Object.assign(r,{async:!0}):{async:!0};let o=n._zod.run({value:t,issues:[]},i);return o instanceof Promise&&(o=await o),o.issues.length?{success:!1,error:new e(o.issues.map(s=>ge(s,i,_e())))}:{success:!0,data:o.value}},Za=In(Zr),za=e=>(n,t,r)=>{const i=r?Object.assign(r,{direction:"backward"}):{direction:"backward"};return st(e)(n,t,i)},Va=e=>(n,t,r)=>st(e)(n,t,r),Ha=e=>async(n,t,r)=>{const i=r?Object.assign(r,{direction:"backward"}):{direction:"backward"};return at(e)(n,t,i)},qa=e=>async(n,t,r)=>at(e)(n,t,r),Ga=e=>(n,t,r)=>{const i=r?Object.assign(r,{direction:"backward"}):{direction:"backward"};return Tn(e)(n,t,i)},ja=e=>(n,t,r)=>Tn(e)(n,t,r),Ba=e=>async(n,t,r)=>{const i=r?Object.assign(r,{direction:"backward"}):{direction:"backward"};return In(e)(n,t,i)},Ya=e=>async(n,t,r)=>In(e)(n,t,r),Ka=/^[cC][^\s-]{8,}$/,Wa=/^[0-9a-z]+$/,Ja=/^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/,Xa=/^[0-9a-vA-V]{20}$/,Qa=/^[A-Za-z0-9]{27}$/,ec=/^[a-zA-Z0-9_-]{21}$/,nc=/^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/,tc=/^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/,Lt=e=>e?new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${e}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`):/^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/,rc=/^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/,ic="^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";function oc(){return new RegExp(ic,"u")}const sc=/^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/,ac=/^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/,cc=/^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/,uc=/^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/,lc=/^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/,zr=/^[A-Za-z0-9_-]*$/,dc=/^\+[1-9]\d{6,14}$/,Vr="(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))",fc=new RegExp(`^${Vr}$`);function Hr(e){const n="(?:[01]\\d|2[0-3]):[0-5]\\d";return typeof e.precision=="number"?e.precision===-1?`${n}`:e.precision===0?`${n}:[0-5]\\d`:`${n}:[0-5]\\d\\.\\d{${e.precision}}`:`${n}(?::[0-5]\\d(?:\\.\\d+)?)?`}function pc(e){return new RegExp(`^${Hr(e)}$`)}function mc(e){const n=Hr({precision:e.precision}),t=["Z"];e.local&&t.push(""),e.offset&&t.push("([+-](?:[01]\\d|2[0-3]):[0-5]\\d)");const r=`${n}(?:${t.join("|")})`;return new RegExp(`^${Vr}T(?:${r})$`)}const hc=e=>{const n=e?`[\\s\\S]{${(e==null?void 0:e.minimum)??0},${(e==null?void 0:e.maximum)??""}}`:"[\\s\\S]*";return new RegExp(`^${n}$`)},_c=/^-?\d+$/,qr=/^-?\d+(?:\.\d+)?$/,gc=/^(?:true|false)$/i,Sc=/^[^A-Z]*$/,vc=/^[^a-z]*$/,X=h("$ZodCheck",(e,n)=>{var t;e._zod??(e._zod={}),e._zod.def=n,(t=e._zod).onattach??(t.onattach=[])}),Gr={number:"number",bigint:"bigint",object:"date"},jr=h("$ZodCheckLessThan",(e,n)=>{X.init(e,n);const t=Gr[typeof n.value];e._zod.onattach.push(r=>{const i=r._zod.bag,o=(n.inclusive?i.maximum:i.exclusiveMaximum)??Number.POSITIVE_INFINITY;n.value<o&&(n.inclusive?i.maximum=n.value:i.exclusiveMaximum=n.value)}),e._zod.check=r=>{(n.inclusive?r.value<=n.value:r.value<n.value)||r.issues.push({origin:t,code:"too_big",maximum:typeof n.value=="object"?n.value.getTime():n.value,input:r.value,inclusive:n.inclusive,inst:e,continue:!n.abort})}}),Br=h("$ZodCheckGreaterThan",(e,n)=>{X.init(e,n);const t=Gr[typeof n.value];e._zod.onattach.push(r=>{const i=r._zod.bag,o=(n.inclusive?i.minimum:i.exclusiveMinimum)??Number.NEGATIVE_INFINITY;n.value>o&&(n.inclusive?i.minimum=n.value:i.exclusiveMinimum=n.value)}),e._zod.check=r=>{(n.inclusive?r.value>=n.value:r.value>n.value)||r.issues.push({origin:t,code:"too_small",minimum:typeof n.value=="object"?n.value.getTime():n.value,input:r.value,inclusive:n.inclusive,inst:e,continue:!n.abort})}}),Ec=h("$ZodCheckMultipleOf",(e,n)=>{X.init(e,n),e._zod.onattach.push(t=>{var r;(r=t._zod.bag).multipleOf??(r.multipleOf=n.value)}),e._zod.check=t=>{if(typeof t.value!=typeof n.value)throw new Error("Cannot mix number and bigint in multiple_of check.");(typeof t.value=="bigint"?t.value%n.value===BigInt(0):Ta(t.value,n.value)===0)||t.issues.push({origin:typeof t.value,code:"not_multiple_of",divisor:n.value,input:t.value,inst:e,continue:!n.abort})}}),yc=h("$ZodCheckNumberFormat",(e,n)=>{var s;X.init(e,n),n.format=n.format||"float64";const t=(s=n.format)==null?void 0:s.includes("int"),r=t?"int":"number",[i,o]=Da[n.format];e._zod.onattach.push(a=>{const c=a._zod.bag;c.format=n.format,c.minimum=i,c.maximum=o,t&&(c.pattern=_c)}),e._zod.check=a=>{const c=a.value;if(t){if(!Number.isInteger(c)){a.issues.push({expected:r,format:n.format,code:"invalid_type",continue:!1,input:c,inst:e});return}if(!Number.isSafeInteger(c)){c>0?a.issues.push({input:c,code:"too_big",maximum:Number.MAX_SAFE_INTEGER,note:"Integers must be within the safe integer range.",inst:e,origin:r,inclusive:!0,continue:!n.abort}):a.issues.push({input:c,code:"too_small",minimum:Number.MIN_SAFE_INTEGER,note:"Integers must be within the safe integer range.",inst:e,origin:r,inclusive:!0,continue:!n.abort});return}}c<i&&a.issues.push({origin:"number",input:c,code:"too_small",minimum:i,inclusive:!0,inst:e,continue:!n.abort}),c>o&&a.issues.push({origin:"number",input:c,code:"too_big",maximum:o,inclusive:!0,inst:e,continue:!n.abort})}}),Cc=h("$ZodCheckMaxLength",(e,n)=>{var t;X.init(e,n),(t=e._zod.def).when??(t.when=r=>{const i=r.value;return!rt(i)&&i.length!==void 0}),e._zod.onattach.push(r=>{const i=r._zod.bag.maximum??Number.POSITIVE_INFINITY;n.maximum<i&&(r._zod.bag.maximum=n.maximum)}),e._zod.check=r=>{const i=r.value;if(i.length<=n.maximum)return;const s=ot(i);r.issues.push({origin:s,code:"too_big",maximum:n.maximum,inclusive:!0,input:i,inst:e,continue:!n.abort})}}),Ac=h("$ZodCheckMinLength",(e,n)=>{var t;X.init(e,n),(t=e._zod.def).when??(t.when=r=>{const i=r.value;return!rt(i)&&i.length!==void 0}),e._zod.onattach.push(r=>{const i=r._zod.bag.minimum??Number.NEGATIVE_INFINITY;n.minimum>i&&(r._zod.bag.minimum=n.minimum)}),e._zod.check=r=>{const i=r.value;if(i.length>=n.minimum)return;const s=ot(i);r.issues.push({origin:s,code:"too_small",minimum:n.minimum,inclusive:!0,input:i,inst:e,continue:!n.abort})}}),Tc=h("$ZodCheckLengthEquals",(e,n)=>{var t;X.init(e,n),(t=e._zod.def).when??(t.when=r=>{const i=r.value;return!rt(i)&&i.length!==void 0}),e._zod.onattach.push(r=>{const i=r._zod.bag;i.minimum=n.length,i.maximum=n.length,i.length=n.length}),e._zod.check=r=>{const i=r.value,o=i.length;if(o===n.length)return;const s=ot(i),a=o>n.length;r.issues.push({origin:s,...a?{code:"too_big",maximum:n.length}:{code:"too_small",minimum:n.length},inclusive:!0,exact:!0,input:r.value,inst:e,continue:!n.abort})}}),On=h("$ZodCheckStringFormat",(e,n)=>{var t,r;X.init(e,n),e._zod.onattach.push(i=>{const o=i._zod.bag;o.format=n.format,n.pattern&&(o.patterns??(o.patterns=new Set),o.patterns.add(n.pattern))}),n.pattern?(t=e._zod).check??(t.check=i=>{n.pattern.lastIndex=0,!n.pattern.test(i.value)&&i.issues.push({origin:"string",code:"invalid_format",format:n.format,input:i.value,...n.pattern?{pattern:n.pattern.toString()}:{},inst:e,continue:!n.abort})}):(r=e._zod).check??(r.check=()=>{})}),Ic=h("$ZodCheckRegex",(e,n)=>{On.init(e,n),e._zod.check=t=>{n.pattern.lastIndex=0,!n.pattern.test(t.value)&&t.issues.push({origin:"string",code:"invalid_format",format:"regex",input:t.value,pattern:n.pattern.toString(),inst:e,continue:!n.abort})}}),Oc=h("$ZodCheckLowerCase",(e,n)=>{n.pattern??(n.pattern=Sc),On.init(e,n)}),Rc=h("$ZodCheckUpperCase",(e,n)=>{n.pattern??(n.pattern=vc),On.init(e,n)}),Nc=h("$ZodCheckIncludes",(e,n)=>{X.init(e,n);const t=ke(n.includes),r=new RegExp(typeof n.position=="number"?`^.{${n.position}}${t}`:t);n.pattern=r,e._zod.onattach.push(i=>{const o=i._zod.bag;o.patterns??(o.patterns=new Set),o.patterns.add(r)}),e._zod.check=i=>{i.value.includes(n.includes,n.position)||i.issues.push({origin:"string",code:"invalid_format",format:"includes",includes:n.includes,input:i.value,inst:e,continue:!n.abort})}}),Dc=h("$ZodCheckStartsWith",(e,n)=>{X.init(e,n);const t=new RegExp(`^${ke(n.prefix)}.*`);n.pattern??(n.pattern=t),e._zod.onattach.push(r=>{const i=r._zod.bag;i.patterns??(i.patterns=new Set),i.patterns.add(t)}),e._zod.check=r=>{r.value.startsWith(n.prefix)||r.issues.push({origin:"string",code:"invalid_format",format:"starts_with",prefix:n.prefix,input:r.value,inst:e,continue:!n.abort})}}),bc=h("$ZodCheckEndsWith",(e,n)=>{X.init(e,n);const t=new RegExp(`.*${ke(n.suffix)}$`);n.pattern??(n.pattern=t),e._zod.onattach.push(r=>{const i=r._zod.bag;i.patterns??(i.patterns=new Set),i.patterns.add(t)}),e._zod.check=r=>{r.value.endsWith(n.suffix)||r.issues.push({origin:"string",code:"invalid_format",format:"ends_with",suffix:n.suffix,input:r.value,inst:e,continue:!n.abort})}}),wc=h("$ZodCheckOverwrite",(e,n)=>{X.init(e,n),e._zod.check=t=>{t.value=n.tx(t.value)}});class kc{constructor(n=[]){this.content=[],this.indent=0,this&&(this.args=n)}indented(n){this.indent+=1,n(this),this.indent-=1}write(n){if(typeof n=="function"){n(this,{execution:"sync"}),n(this,{execution:"async"});return}const r=n.split(`
`).filter(s=>s),i=Math.min(...r.map(s=>s.length-s.trimStart().length)),o=r.map(s=>s.slice(i)).map(s=>" ".repeat(this.indent*2)+s);for(const s of o)this.content.push(s)}compile(){const n=Function,t=this==null?void 0:this.args,i=[...((this==null?void 0:this.content)??[""]).map(o=>`  ${o}`)];return new n(...t,i.join(`
`))}}const Lc={major:4,minor:3,patch:6},b=h("$ZodType",(e,n)=>{var i;var t;e??(e={}),e._zod.def=n,e._zod.bag=e._zod.bag||{},e._zod.version=Lc;const r=[...e._zod.def.checks??[]];e._zod.traits.has("$ZodCheck")&&r.unshift(e);for(const o of r)for(const s of o._zod.onattach)s(e);if(r.length===0)(t=e._zod).deferred??(t.deferred=[]),(i=e._zod.deferred)==null||i.push(()=>{e._zod.run=e._zod.parse});else{const o=(a,c,u)=>{let l=Oe(a),d;for(const p of c){if(p._zod.def.when){if(!p._zod.def.when(a))continue}else if(l)continue;const m=a.issues.length,g=p._zod.check(a);if(g instanceof Promise&&(u==null?void 0:u.async)===!1)throw new be;if(d||g instanceof Promise)d=(d??Promise.resolve()).then(async()=>{await g,a.issues.length!==m&&(l||(l=Oe(a,m)))});else{if(a.issues.length===m)continue;l||(l=Oe(a,m))}}return d?d.then(()=>a):a},s=(a,c,u)=>{if(Oe(a))return a.aborted=!0,a;const l=o(c,r,u);if(l instanceof Promise){if(u.async===!1)throw new be;return l.then(d=>e._zod.parse(d,u))}return e._zod.parse(l,u)};e._zod.run=(a,c)=>{if(c.skipChecks)return e._zod.parse(a,c);if(c.direction==="backward"){const l=e._zod.parse({value:a.value,issues:[]},{...c,skipChecks:!0});return l instanceof Promise?l.then(d=>s(d,a,c)):s(l,a,c)}const u=e._zod.parse(a,c);if(u instanceof Promise){if(c.async===!1)throw new be;return u.then(l=>o(l,r,c))}return o(u,r,c)}}D(e,"~standard",()=>({validate:o=>{var s;try{const a=Ua(e,o);return a.success?{value:a.data}:{issues:(s=a.error)==null?void 0:s.issues}}catch{return Za(e,o).then(c=>{var u;return c.success?{value:c.data}:{issues:(u=c.error)==null?void 0:u.issues}})}},vendor:"zod",version:1}))}),ct=h("$ZodString",(e,n)=>{var t;b.init(e,n),e._zod.pattern=[...((t=e==null?void 0:e._zod.bag)==null?void 0:t.patterns)??[]].pop()??hc(e._zod.bag),e._zod.parse=(r,i)=>{if(n.coerce)try{r.value=String(r.value)}catch{}return typeof r.value=="string"||r.issues.push({expected:"string",code:"invalid_type",input:r.value,inst:e}),r}}),w=h("$ZodStringFormat",(e,n)=>{On.init(e,n),ct.init(e,n)}),xc=h("$ZodGUID",(e,n)=>{n.pattern??(n.pattern=tc),w.init(e,n)}),Fc=h("$ZodUUID",(e,n)=>{if(n.version){const r={v1:1,v2:2,v3:3,v4:4,v5:5,v6:6,v7:7,v8:8}[n.version];if(r===void 0)throw new Error(`Invalid UUID version: "${n.version}"`);n.pattern??(n.pattern=Lt(r))}else n.pattern??(n.pattern=Lt());w.init(e,n)}),$c=h("$ZodEmail",(e,n)=>{n.pattern??(n.pattern=rc),w.init(e,n)}),Pc=h("$ZodURL",(e,n)=>{w.init(e,n),e._zod.check=t=>{try{const r=t.value.trim(),i=new URL(r);n.hostname&&(n.hostname.lastIndex=0,n.hostname.test(i.hostname)||t.issues.push({code:"invalid_format",format:"url",note:"Invalid hostname",pattern:n.hostname.source,input:t.value,inst:e,continue:!n.abort})),n.protocol&&(n.protocol.lastIndex=0,n.protocol.test(i.protocol.endsWith(":")?i.protocol.slice(0,-1):i.protocol)||t.issues.push({code:"invalid_format",format:"url",note:"Invalid protocol",pattern:n.protocol.source,input:t.value,inst:e,continue:!n.abort})),n.normalize?t.value=i.href:t.value=r;return}catch{t.issues.push({code:"invalid_format",format:"url",input:t.value,inst:e,continue:!n.abort})}}}),Mc=h("$ZodEmoji",(e,n)=>{n.pattern??(n.pattern=oc()),w.init(e,n)}),Uc=h("$ZodNanoID",(e,n)=>{n.pattern??(n.pattern=ec),w.init(e,n)}),Zc=h("$ZodCUID",(e,n)=>{n.pattern??(n.pattern=Ka),w.init(e,n)}),zc=h("$ZodCUID2",(e,n)=>{n.pattern??(n.pattern=Wa),w.init(e,n)}),Vc=h("$ZodULID",(e,n)=>{n.pattern??(n.pattern=Ja),w.init(e,n)}),Hc=h("$ZodXID",(e,n)=>{n.pattern??(n.pattern=Xa),w.init(e,n)}),qc=h("$ZodKSUID",(e,n)=>{n.pattern??(n.pattern=Qa),w.init(e,n)}),Gc=h("$ZodISODateTime",(e,n)=>{n.pattern??(n.pattern=mc(n)),w.init(e,n)}),jc=h("$ZodISODate",(e,n)=>{n.pattern??(n.pattern=fc),w.init(e,n)}),Bc=h("$ZodISOTime",(e,n)=>{n.pattern??(n.pattern=pc(n)),w.init(e,n)}),Yc=h("$ZodISODuration",(e,n)=>{n.pattern??(n.pattern=nc),w.init(e,n)}),Kc=h("$ZodIPv4",(e,n)=>{n.pattern??(n.pattern=sc),w.init(e,n),e._zod.bag.format="ipv4"}),Wc=h("$ZodIPv6",(e,n)=>{n.pattern??(n.pattern=ac),w.init(e,n),e._zod.bag.format="ipv6",e._zod.check=t=>{try{new URL(`http://[${t.value}]`)}catch{t.issues.push({code:"invalid_format",format:"ipv6",input:t.value,inst:e,continue:!n.abort})}}}),Jc=h("$ZodCIDRv4",(e,n)=>{n.pattern??(n.pattern=cc),w.init(e,n)}),Xc=h("$ZodCIDRv6",(e,n)=>{n.pattern??(n.pattern=uc),w.init(e,n),e._zod.check=t=>{const r=t.value.split("/");try{if(r.length!==2)throw new Error;const[i,o]=r;if(!o)throw new Error;const s=Number(o);if(`${s}`!==o)throw new Error;if(s<0||s>128)throw new Error;new URL(`http://[${i}]`)}catch{t.issues.push({code:"invalid_format",format:"cidrv6",input:t.value,inst:e,continue:!n.abort})}}});function Yr(e){if(e==="")return!0;if(e.length%4!==0)return!1;try{return atob(e),!0}catch{return!1}}const Qc=h("$ZodBase64",(e,n)=>{n.pattern??(n.pattern=lc),w.init(e,n),e._zod.bag.contentEncoding="base64",e._zod.check=t=>{Yr(t.value)||t.issues.push({code:"invalid_format",format:"base64",input:t.value,inst:e,continue:!n.abort})}});function eu(e){if(!zr.test(e))return!1;const n=e.replace(/[-_]/g,r=>r==="-"?"+":"/"),t=n.padEnd(Math.ceil(n.length/4)*4,"=");return Yr(t)}const nu=h("$ZodBase64URL",(e,n)=>{n.pattern??(n.pattern=zr),w.init(e,n),e._zod.bag.contentEncoding="base64url",e._zod.check=t=>{eu(t.value)||t.issues.push({code:"invalid_format",format:"base64url",input:t.value,inst:e,continue:!n.abort})}}),tu=h("$ZodE164",(e,n)=>{n.pattern??(n.pattern=dc),w.init(e,n)});function ru(e,n=null){try{const t=e.split(".");if(t.length!==3)return!1;const[r]=t;if(!r)return!1;const i=JSON.parse(atob(r));return!("typ"in i&&(i==null?void 0:i.typ)!=="JWT"||!i.alg||n&&(!("alg"in i)||i.alg!==n))}catch{return!1}}const iu=h("$ZodJWT",(e,n)=>{w.init(e,n),e._zod.check=t=>{ru(t.value,n.alg)||t.issues.push({code:"invalid_format",format:"jwt",input:t.value,inst:e,continue:!n.abort})}}),Kr=h("$ZodNumber",(e,n)=>{b.init(e,n),e._zod.pattern=e._zod.bag.pattern??qr,e._zod.parse=(t,r)=>{if(n.coerce)try{t.value=Number(t.value)}catch{}const i=t.value;if(typeof i=="number"&&!Number.isNaN(i)&&Number.isFinite(i))return t;const o=typeof i=="number"?Number.isNaN(i)?"NaN":Number.isFinite(i)?void 0:"Infinity":void 0;return t.issues.push({expected:"number",code:"invalid_type",input:i,inst:e,...o?{received:o}:{}}),t}}),ou=h("$ZodNumberFormat",(e,n)=>{yc.init(e,n),Kr.init(e,n)}),su=h("$ZodBoolean",(e,n)=>{b.init(e,n),e._zod.pattern=gc,e._zod.parse=(t,r)=>{if(n.coerce)try{t.value=!!t.value}catch{}const i=t.value;return typeof i=="boolean"||t.issues.push({expected:"boolean",code:"invalid_type",input:i,inst:e}),t}}),au=h("$ZodAny",(e,n)=>{b.init(e,n),e._zod.parse=t=>t}),cu=h("$ZodUnknown",(e,n)=>{b.init(e,n),e._zod.parse=t=>t}),uu=h("$ZodNever",(e,n)=>{b.init(e,n),e._zod.parse=(t,r)=>(t.issues.push({expected:"never",code:"invalid_type",input:t.value,inst:e}),t)});function xt(e,n,t){e.issues.length&&n.issues.push(...Re(t,e.issues)),n.value[t]=e.value}const lu=h("$ZodArray",(e,n)=>{b.init(e,n),e._zod.parse=(t,r)=>{const i=t.value;if(!Array.isArray(i))return t.issues.push({expected:"array",code:"invalid_type",input:i,inst:e}),t;t.value=Array(i.length);const o=[];for(let s=0;s<i.length;s++){const a=i[s],c=n.element._zod.run({value:a,issues:[]},r);c instanceof Promise?o.push(c.then(u=>xt(u,t,s))):xt(c,t,s)}return o.length?Promise.all(o).then(()=>t):t}});function pn(e,n,t,r,i){if(e.issues.length){if(i&&!(t in r))return;n.issues.push(...Re(t,e.issues))}e.value===void 0?t in r&&(n.value[t]=void 0):n.value[t]=e.value}function Wr(e){var r,i,o,s;const n=Object.keys(e.shape);for(const a of n)if(!((s=(o=(i=(r=e.shape)==null?void 0:r[a])==null?void 0:i._zod)==null?void 0:o.traits)!=null&&s.has("$ZodType")))throw new Error(`Invalid element at key "${a}": expected a Zod schema`);const t=Na(e.shape);return{...e,keys:n,keySet:new Set(n),numKeys:n.length,optionalKeys:new Set(t)}}function Jr(e,n,t,r,i,o){const s=[],a=i.keySet,c=i.catchall._zod,u=c.def.type,l=c.optout==="optional";for(const d in n){if(a.has(d))continue;if(u==="never"){s.push(d);continue}const p=c.run({value:n[d],issues:[]},r);p instanceof Promise?e.push(p.then(m=>pn(m,t,d,n,l))):pn(p,t,d,n,l)}return s.length&&t.issues.push({code:"unrecognized_keys",keys:s,input:n,inst:o}),e.length?Promise.all(e).then(()=>t):t}const du=h("$ZodObject",(e,n)=>{b.init(e,n);const t=Object.getOwnPropertyDescriptor(n,"shape");if(!(t!=null&&t.get)){const a=n.shape;Object.defineProperty(n,"shape",{get:()=>{const c={...a};return Object.defineProperty(n,"shape",{value:c}),c}})}const r=tt(()=>Wr(n));D(e._zod,"propValues",()=>{const a=n.shape,c={};for(const u in a){const l=a[u]._zod;if(l.values){c[u]??(c[u]=new Set);for(const d of l.values)c[u].add(d)}}return c});const i=fn,o=n.catchall;let s;e._zod.parse=(a,c)=>{s??(s=r.value);const u=a.value;if(!i(u))return a.issues.push({expected:"object",code:"invalid_type",input:u,inst:e}),a;a.value={};const l=[],d=s.shape;for(const p of s.keys){const m=d[p],g=m._zod.optout==="optional",v=m._zod.run({value:u[p],issues:[]},c);v instanceof Promise?l.push(v.then(y=>pn(y,a,p,u,g))):pn(v,a,p,u,g)}return o?Jr(l,u,a,c,r.value,e):l.length?Promise.all(l).then(()=>a):a}}),fu=h("$ZodObjectJIT",(e,n)=>{du.init(e,n);const t=e._zod.parse,r=tt(()=>Wr(n)),i=p=>{var le;const m=new kc(["shape","payload","ctx"]),g=r.value,v=ee=>{const F=kt(ee);return`shape[${F}]._zod.run({ value: input[${F}], issues: [] }, ctx)`};m.write("const input = payload.value;");const y=Object.create(null);let N=0;for(const ee of g.keys)y[ee]=`key_${N++}`;m.write("const newResult = {};");for(const ee of g.keys){const F=y[ee],G=kt(ee),He=p[ee],Do=((le=He==null?void 0:He._zod)==null?void 0:le.optout)==="optional";m.write(`const ${F} = ${v(ee)};`),Do?m.write(`
        if (${F}.issues.length) {
          if (${G} in input) {
            payload.issues = payload.issues.concat(${F}.issues.map(iss => ({
              ...iss,
              path: iss.path ? [${G}, ...iss.path] : [${G}]
            })));
          }
        }
        
        if (${F}.value === undefined) {
          if (${G} in input) {
            newResult[${G}] = undefined;
          }
        } else {
          newResult[${G}] = ${F}.value;
        }
        
      `):m.write(`
        if (${F}.issues.length) {
          payload.issues = payload.issues.concat(${F}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${G}, ...iss.path] : [${G}]
          })));
        }
        
        if (${F}.value === undefined) {
          if (${G} in input) {
            newResult[${G}] = undefined;
          }
        } else {
          newResult[${G}] = ${F}.value;
        }
        
      `)}m.write("payload.value = newResult;"),m.write("return payload;");const A=m.compile();return(ee,F)=>A(p,ee,F)};let o;const s=fn,a=!xr.jitless,u=a&&Oa.value,l=n.catchall;let d;e._zod.parse=(p,m)=>{d??(d=r.value);const g=p.value;return s(g)?a&&u&&(m==null?void 0:m.async)===!1&&m.jitless!==!0?(o||(o=i(n.shape)),p=o(p,m),l?Jr([],g,p,m,d,e):p):t(p,m):(p.issues.push({expected:"object",code:"invalid_type",input:g,inst:e}),p)}});function Ft(e,n,t,r){for(const o of e)if(o.issues.length===0)return n.value=o.value,n;const i=e.filter(o=>!Oe(o));return i.length===1?(n.value=i[0].value,i[0]):(n.issues.push({code:"invalid_union",input:n.value,inst:t,errors:e.map(o=>o.issues.map(s=>ge(s,r,_e())))}),n)}const pu=h("$ZodUnion",(e,n)=>{b.init(e,n),D(e._zod,"optin",()=>n.options.some(i=>i._zod.optin==="optional")?"optional":void 0),D(e._zod,"optout",()=>n.options.some(i=>i._zod.optout==="optional")?"optional":void 0),D(e._zod,"values",()=>{if(n.options.every(i=>i._zod.values))return new Set(n.options.flatMap(i=>Array.from(i._zod.values)))}),D(e._zod,"pattern",()=>{if(n.options.every(i=>i._zod.pattern)){const i=n.options.map(o=>o._zod.pattern);return new RegExp(`^(${i.map(o=>it(o.source)).join("|")})$`)}});const t=n.options.length===1,r=n.options[0]._zod.run;e._zod.parse=(i,o)=>{if(t)return r(i,o);let s=!1;const a=[];for(const c of n.options){const u=c._zod.run({value:i.value,issues:[]},o);if(u instanceof Promise)a.push(u),s=!0;else{if(u.issues.length===0)return u;a.push(u)}}return s?Promise.all(a).then(c=>Ft(c,i,e,o)):Ft(a,i,e,o)}}),mu=h("$ZodIntersection",(e,n)=>{b.init(e,n),e._zod.parse=(t,r)=>{const i=t.value,o=n.left._zod.run({value:i,issues:[]},r),s=n.right._zod.run({value:i,issues:[]},r);return o instanceof Promise||s instanceof Promise?Promise.all([o,s]).then(([c,u])=>$t(t,c,u)):$t(t,o,s)}});function Zn(e,n){if(e===n)return{valid:!0,data:e};if(e instanceof Date&&n instanceof Date&&+e==+n)return{valid:!0,data:e};if(we(e)&&we(n)){const t=Object.keys(n),r=Object.keys(e).filter(o=>t.indexOf(o)!==-1),i={...e,...n};for(const o of r){const s=Zn(e[o],n[o]);if(!s.valid)return{valid:!1,mergeErrorPath:[o,...s.mergeErrorPath]};i[o]=s.data}return{valid:!0,data:i}}if(Array.isArray(e)&&Array.isArray(n)){if(e.length!==n.length)return{valid:!1,mergeErrorPath:[]};const t=[];for(let r=0;r<e.length;r++){const i=e[r],o=n[r],s=Zn(i,o);if(!s.valid)return{valid:!1,mergeErrorPath:[r,...s.mergeErrorPath]};t.push(s.data)}return{valid:!0,data:t}}return{valid:!1,mergeErrorPath:[]}}function $t(e,n,t){const r=new Map;let i;for(const a of n.issues)if(a.code==="unrecognized_keys"){i??(i=a);for(const c of a.keys)r.has(c)||r.set(c,{}),r.get(c).l=!0}else e.issues.push(a);for(const a of t.issues)if(a.code==="unrecognized_keys")for(const c of a.keys)r.has(c)||r.set(c,{}),r.get(c).r=!0;else e.issues.push(a);const o=[...r].filter(([,a])=>a.l&&a.r).map(([a])=>a);if(o.length&&i&&e.issues.push({...i,keys:o}),Oe(e))return e;const s=Zn(n.value,t.value);if(!s.valid)throw new Error(`Unmergable intersection. Error path: ${JSON.stringify(s.mergeErrorPath)}`);return e.value=s.data,e}const hu=h("$ZodRecord",(e,n)=>{b.init(e,n),e._zod.parse=(t,r)=>{const i=t.value;if(!we(i))return t.issues.push({expected:"record",code:"invalid_type",input:i,inst:e}),t;const o=[],s=n.keyType._zod.values;if(s){t.value={};const a=new Set;for(const u of s)if(typeof u=="string"||typeof u=="number"||typeof u=="symbol"){a.add(typeof u=="number"?u.toString():u);const l=n.valueType._zod.run({value:i[u],issues:[]},r);l instanceof Promise?o.push(l.then(d=>{d.issues.length&&t.issues.push(...Re(u,d.issues)),t.value[u]=d.value})):(l.issues.length&&t.issues.push(...Re(u,l.issues)),t.value[u]=l.value)}let c;for(const u in i)a.has(u)||(c=c??[],c.push(u));c&&c.length>0&&t.issues.push({code:"unrecognized_keys",input:i,inst:e,keys:c})}else{t.value={};for(const a of Reflect.ownKeys(i)){if(a==="__proto__")continue;let c=n.keyType._zod.run({value:a,issues:[]},r);if(c instanceof Promise)throw new Error("Async schemas not supported in object keys currently");if(typeof a=="string"&&qr.test(a)&&c.issues.length){const d=n.keyType._zod.run({value:Number(a),issues:[]},r);if(d instanceof Promise)throw new Error("Async schemas not supported in object keys currently");d.issues.length===0&&(c=d)}if(c.issues.length){n.mode==="loose"?t.value[a]=i[a]:t.issues.push({code:"invalid_key",origin:"record",issues:c.issues.map(d=>ge(d,r,_e())),input:a,path:[a],inst:e});continue}const l=n.valueType._zod.run({value:i[a],issues:[]},r);l instanceof Promise?o.push(l.then(d=>{d.issues.length&&t.issues.push(...Re(a,d.issues)),t.value[c.value]=d.value})):(l.issues.length&&t.issues.push(...Re(a,l.issues)),t.value[c.value]=l.value)}}return o.length?Promise.all(o).then(()=>t):t}}),_u=h("$ZodEnum",(e,n)=>{b.init(e,n);const t=Fr(n.entries),r=new Set(t);e._zod.values=r,e._zod.pattern=new RegExp(`^(${t.filter(i=>Ra.has(typeof i)).map(i=>typeof i=="string"?ke(i):i.toString()).join("|")})$`),e._zod.parse=(i,o)=>{const s=i.value;return r.has(s)||i.issues.push({code:"invalid_value",values:t,input:s,inst:e}),i}}),gu=h("$ZodLiteral",(e,n)=>{if(b.init(e,n),n.values.length===0)throw new Error("Cannot create literal schema with no valid values");const t=new Set(n.values);e._zod.values=t,e._zod.pattern=new RegExp(`^(${n.values.map(r=>typeof r=="string"?ke(r):r?ke(r.toString()):String(r)).join("|")})$`),e._zod.parse=(r,i)=>{const o=r.value;return t.has(o)||r.issues.push({code:"invalid_value",values:n.values,input:o,inst:e}),r}}),Su=h("$ZodTransform",(e,n)=>{b.init(e,n),e._zod.parse=(t,r)=>{if(r.direction==="backward")throw new Lr(e.constructor.name);const i=n.transform(t.value,t);if(r.async)return(i instanceof Promise?i:Promise.resolve(i)).then(s=>(t.value=s,t));if(i instanceof Promise)throw new be;return t.value=i,t}});function Pt(e,n){return e.issues.length&&n===void 0?{issues:[],value:void 0}:e}const Xr=h("$ZodOptional",(e,n)=>{b.init(e,n),e._zod.optin="optional",e._zod.optout="optional",D(e._zod,"values",()=>n.innerType._zod.values?new Set([...n.innerType._zod.values,void 0]):void 0),D(e._zod,"pattern",()=>{const t=n.innerType._zod.pattern;return t?new RegExp(`^(${it(t.source)})?$`):void 0}),e._zod.parse=(t,r)=>{if(n.innerType._zod.optin==="optional"){const i=n.innerType._zod.run(t,r);return i instanceof Promise?i.then(o=>Pt(o,t.value)):Pt(i,t.value)}return t.value===void 0?t:n.innerType._zod.run(t,r)}}),vu=h("$ZodExactOptional",(e,n)=>{Xr.init(e,n),D(e._zod,"values",()=>n.innerType._zod.values),D(e._zod,"pattern",()=>n.innerType._zod.pattern),e._zod.parse=(t,r)=>n.innerType._zod.run(t,r)}),Eu=h("$ZodNullable",(e,n)=>{b.init(e,n),D(e._zod,"optin",()=>n.innerType._zod.optin),D(e._zod,"optout",()=>n.innerType._zod.optout),D(e._zod,"pattern",()=>{const t=n.innerType._zod.pattern;return t?new RegExp(`^(${it(t.source)}|null)$`):void 0}),D(e._zod,"values",()=>n.innerType._zod.values?new Set([...n.innerType._zod.values,null]):void 0),e._zod.parse=(t,r)=>t.value===null?t:n.innerType._zod.run(t,r)}),yu=h("$ZodDefault",(e,n)=>{b.init(e,n),e._zod.optin="optional",D(e._zod,"values",()=>n.innerType._zod.values),e._zod.parse=(t,r)=>{if(r.direction==="backward")return n.innerType._zod.run(t,r);if(t.value===void 0)return t.value=n.defaultValue,t;const i=n.innerType._zod.run(t,r);return i instanceof Promise?i.then(o=>Mt(o,n)):Mt(i,n)}});function Mt(e,n){return e.value===void 0&&(e.value=n.defaultValue),e}const Cu=h("$ZodPrefault",(e,n)=>{b.init(e,n),e._zod.optin="optional",D(e._zod,"values",()=>n.innerType._zod.values),e._zod.parse=(t,r)=>(r.direction==="backward"||t.value===void 0&&(t.value=n.defaultValue),n.innerType._zod.run(t,r))}),Au=h("$ZodNonOptional",(e,n)=>{b.init(e,n),D(e._zod,"values",()=>{const t=n.innerType._zod.values;return t?new Set([...t].filter(r=>r!==void 0)):void 0}),e._zod.parse=(t,r)=>{const i=n.innerType._zod.run(t,r);return i instanceof Promise?i.then(o=>Ut(o,e)):Ut(i,e)}});function Ut(e,n){return!e.issues.length&&e.value===void 0&&e.issues.push({code:"invalid_type",expected:"nonoptional",input:e.value,inst:n}),e}const Tu=h("$ZodCatch",(e,n)=>{b.init(e,n),D(e._zod,"optin",()=>n.innerType._zod.optin),D(e._zod,"optout",()=>n.innerType._zod.optout),D(e._zod,"values",()=>n.innerType._zod.values),e._zod.parse=(t,r)=>{if(r.direction==="backward")return n.innerType._zod.run(t,r);const i=n.innerType._zod.run(t,r);return i instanceof Promise?i.then(o=>(t.value=o.value,o.issues.length&&(t.value=n.catchValue({...t,error:{issues:o.issues.map(s=>ge(s,r,_e()))},input:t.value}),t.issues=[]),t)):(t.value=i.value,i.issues.length&&(t.value=n.catchValue({...t,error:{issues:i.issues.map(o=>ge(o,r,_e()))},input:t.value}),t.issues=[]),t)}}),Iu=h("$ZodPipe",(e,n)=>{b.init(e,n),D(e._zod,"values",()=>n.in._zod.values),D(e._zod,"optin",()=>n.in._zod.optin),D(e._zod,"optout",()=>n.out._zod.optout),D(e._zod,"propValues",()=>n.in._zod.propValues),e._zod.parse=(t,r)=>{if(r.direction==="backward"){const o=n.out._zod.run(t,r);return o instanceof Promise?o.then(s=>an(s,n.in,r)):an(o,n.in,r)}const i=n.in._zod.run(t,r);return i instanceof Promise?i.then(o=>an(o,n.out,r)):an(i,n.out,r)}});function an(e,n,t){return e.issues.length?(e.aborted=!0,e):n._zod.run({value:e.value,issues:e.issues},t)}const Ou=h("$ZodReadonly",(e,n)=>{b.init(e,n),D(e._zod,"propValues",()=>n.innerType._zod.propValues),D(e._zod,"values",()=>n.innerType._zod.values),D(e._zod,"optin",()=>{var t,r;return(r=(t=n.innerType)==null?void 0:t._zod)==null?void 0:r.optin}),D(e._zod,"optout",()=>{var t,r;return(r=(t=n.innerType)==null?void 0:t._zod)==null?void 0:r.optout}),e._zod.parse=(t,r)=>{if(r.direction==="backward")return n.innerType._zod.run(t,r);const i=n.innerType._zod.run(t,r);return i instanceof Promise?i.then(Zt):Zt(i)}});function Zt(e){return e.value=Object.freeze(e.value),e}const Ru=h("$ZodCustom",(e,n)=>{X.init(e,n),b.init(e,n),e._zod.parse=(t,r)=>t,e._zod.check=t=>{const r=t.value,i=n.fn(r);if(i instanceof Promise)return i.then(o=>zt(o,t,r,e));zt(i,t,r,e)}});function zt(e,n,t,r){if(!e){const i={code:"custom",input:t,inst:r,path:[...r._zod.def.path??[]],continue:!r._zod.def.abort};r._zod.def.params&&(i.params=r._zod.def.params),n.issues.push(Ke(i))}}var Vt;class Nu{constructor(){this._map=new WeakMap,this._idmap=new Map}add(n,...t){const r=t[0];return this._map.set(n,r),r&&typeof r=="object"&&"id"in r&&this._idmap.set(r.id,n),this}clear(){return this._map=new WeakMap,this._idmap=new Map,this}remove(n){const t=this._map.get(n);return t&&typeof t=="object"&&"id"in t&&this._idmap.delete(t.id),this._map.delete(n),this}get(n){const t=n._zod.parent;if(t){const r={...this.get(t)??{}};delete r.id;const i={...r,...this._map.get(n)};return Object.keys(i).length?i:void 0}return this._map.get(n)}has(n){return this._map.has(n)}}function Du(){return new Nu}(Vt=globalThis).__zod_globalRegistry??(Vt.__zod_globalRegistry=Du());const Ge=globalThis.__zod_globalRegistry;function bu(e,n){return new e({type:"string",...I(n)})}function wu(e,n){return new e({type:"string",format:"email",check:"string_format",abort:!1,...I(n)})}function Ht(e,n){return new e({type:"string",format:"guid",check:"string_format",abort:!1,...I(n)})}function ku(e,n){return new e({type:"string",format:"uuid",check:"string_format",abort:!1,...I(n)})}function Lu(e,n){return new e({type:"string",format:"uuid",check:"string_format",abort:!1,version:"v4",...I(n)})}function xu(e,n){return new e({type:"string",format:"uuid",check:"string_format",abort:!1,version:"v6",...I(n)})}function Fu(e,n){return new e({type:"string",format:"uuid",check:"string_format",abort:!1,version:"v7",...I(n)})}function $u(e,n){return new e({type:"string",format:"url",check:"string_format",abort:!1,...I(n)})}function Pu(e,n){return new e({type:"string",format:"emoji",check:"string_format",abort:!1,...I(n)})}function Mu(e,n){return new e({type:"string",format:"nanoid",check:"string_format",abort:!1,...I(n)})}function Uu(e,n){return new e({type:"string",format:"cuid",check:"string_format",abort:!1,...I(n)})}function Zu(e,n){return new e({type:"string",format:"cuid2",check:"string_format",abort:!1,...I(n)})}function zu(e,n){return new e({type:"string",format:"ulid",check:"string_format",abort:!1,...I(n)})}function Vu(e,n){return new e({type:"string",format:"xid",check:"string_format",abort:!1,...I(n)})}function Hu(e,n){return new e({type:"string",format:"ksuid",check:"string_format",abort:!1,...I(n)})}function qu(e,n){return new e({type:"string",format:"ipv4",check:"string_format",abort:!1,...I(n)})}function Gu(e,n){return new e({type:"string",format:"ipv6",check:"string_format",abort:!1,...I(n)})}function ju(e,n){return new e({type:"string",format:"cidrv4",check:"string_format",abort:!1,...I(n)})}function Bu(e,n){return new e({type:"string",format:"cidrv6",check:"string_format",abort:!1,...I(n)})}function Yu(e,n){return new e({type:"string",format:"base64",check:"string_format",abort:!1,...I(n)})}function Ku(e,n){return new e({type:"string",format:"base64url",check:"string_format",abort:!1,...I(n)})}function Wu(e,n){return new e({type:"string",format:"e164",check:"string_format",abort:!1,...I(n)})}function Ju(e,n){return new e({type:"string",format:"jwt",check:"string_format",abort:!1,...I(n)})}function Xu(e,n){return new e({type:"string",format:"datetime",check:"string_format",offset:!1,local:!1,precision:null,...I(n)})}function Qu(e,n){return new e({type:"string",format:"date",check:"string_format",...I(n)})}function el(e,n){return new e({type:"string",format:"time",check:"string_format",precision:null,...I(n)})}function nl(e,n){return new e({type:"string",format:"duration",check:"string_format",...I(n)})}function tl(e,n){return new e({type:"number",checks:[],...I(n)})}function rl(e,n){return new e({type:"number",check:"number_format",abort:!1,format:"safeint",...I(n)})}function il(e,n){return new e({type:"boolean",...I(n)})}function ol(e){return new e({type:"any"})}function sl(e){return new e({type:"unknown"})}function al(e,n){return new e({type:"never",...I(n)})}function qt(e,n){return new jr({check:"less_than",...I(n),value:e,inclusive:!1})}function bn(e,n){return new jr({check:"less_than",...I(n),value:e,inclusive:!0})}function Gt(e,n){return new Br({check:"greater_than",...I(n),value:e,inclusive:!1})}function wn(e,n){return new Br({check:"greater_than",...I(n),value:e,inclusive:!0})}function jt(e,n){return new Ec({check:"multiple_of",...I(n),value:e})}function Qr(e,n){return new Cc({check:"max_length",...I(n),maximum:e})}function mn(e,n){return new Ac({check:"min_length",...I(n),minimum:e})}function ei(e,n){return new Tc({check:"length_equals",...I(n),length:e})}function cl(e,n){return new Ic({check:"string_format",format:"regex",...I(n),pattern:e})}function ul(e){return new Oc({check:"string_format",format:"lowercase",...I(e)})}function ll(e){return new Rc({check:"string_format",format:"uppercase",...I(e)})}function dl(e,n){return new Nc({check:"string_format",format:"includes",...I(n),includes:e})}function fl(e,n){return new Dc({check:"string_format",format:"starts_with",...I(n),prefix:e})}function pl(e,n){return new bc({check:"string_format",format:"ends_with",...I(n),suffix:e})}function Me(e){return new wc({check:"overwrite",tx:e})}function ml(e){return Me(n=>n.normalize(e))}function hl(){return Me(e=>e.trim())}function _l(){return Me(e=>e.toLowerCase())}function gl(){return Me(e=>e.toUpperCase())}function Sl(){return Me(e=>Ia(e))}function vl(e,n,t){return new e({type:"array",element:n,...I(t)})}function El(e,n,t){return new e({type:"custom",check:"custom",fn:n,...I(t)})}function yl(e){const n=Cl(t=>(t.addIssue=r=>{if(typeof r=="string")t.issues.push(Ke(r,t.value,n._zod.def));else{const i=r;i.fatal&&(i.continue=!1),i.code??(i.code="custom"),i.input??(i.input=t.value),i.inst??(i.inst=n),i.continue??(i.continue=!n._zod.def.abort),t.issues.push(Ke(i))}},e(t.value,t)));return n}function Cl(e,n){const t=new X({check:"custom",...I(n)});return t._zod.check=e,t}function ni(e){let n=(e==null?void 0:e.target)??"draft-2020-12";return n==="draft-4"&&(n="draft-04"),n==="draft-7"&&(n="draft-07"),{processors:e.processors??{},metadataRegistry:(e==null?void 0:e.metadata)??Ge,target:n,unrepresentable:(e==null?void 0:e.unrepresentable)??"throw",override:(e==null?void 0:e.override)??(()=>{}),io:(e==null?void 0:e.io)??"output",counter:0,seen:new Map,cycles:(e==null?void 0:e.cycles)??"ref",reused:(e==null?void 0:e.reused)??"inline",external:(e==null?void 0:e.external)??void 0}}function P(e,n,t={path:[],schemaPath:[]}){var l,d;var r;const i=e._zod.def,o=n.seen.get(e);if(o)return o.count++,t.schemaPath.includes(e)&&(o.cycle=t.path),o.schema;const s={schema:{},count:1,cycle:void 0,path:t.path};n.seen.set(e,s);const a=(d=(l=e._zod).toJSONSchema)==null?void 0:d.call(l);if(a)s.schema=a;else{const p={...t,schemaPath:[...t.schemaPath,e],path:t.path};if(e._zod.processJSONSchema)e._zod.processJSONSchema(n,s.schema,p);else{const g=s.schema,v=n.processors[i.type];if(!v)throw new Error(`[toJSONSchema]: Non-representable type encountered: ${i.type}`);v(e,n,g,p)}const m=e._zod.parent;m&&(s.ref||(s.ref=m),P(m,n,p),n.seen.get(m).isParent=!0)}const c=n.metadataRegistry.get(e);return c&&Object.assign(s.schema,c),n.io==="input"&&j(e)&&(delete s.schema.examples,delete s.schema.default),n.io==="input"&&s.schema._prefault&&((r=s.schema).default??(r.default=s.schema._prefault)),delete s.schema._prefault,n.seen.get(e).schema}function ti(e,n){var s,a,c,u;const t=e.seen.get(n);if(!t)throw new Error("Unprocessed schema. This is a bug in Zod.");const r=new Map;for(const l of e.seen.entries()){const d=(s=e.metadataRegistry.get(l[0]))==null?void 0:s.id;if(d){const p=r.get(d);if(p&&p!==l[0])throw new Error(`Duplicate schema id "${d}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`);r.set(d,l[0])}}const i=l=>{var v;const d=e.target==="draft-2020-12"?"$defs":"definitions";if(e.external){const y=(v=e.external.registry.get(l[0]))==null?void 0:v.id,N=e.external.uri??(le=>le);if(y)return{ref:N(y)};const A=l[1].defId??l[1].schema.id??`schema${e.counter++}`;return l[1].defId=A,{defId:A,ref:`${N("__shared")}#/${d}/${A}`}}if(l[1]===t)return{ref:"#"};const m=`#/${d}/`,g=l[1].schema.id??`__schema${e.counter++}`;return{defId:g,ref:m+g}},o=l=>{if(l[1].schema.$ref)return;const d=l[1],{ref:p,defId:m}=i(l);d.def={...d.schema},m&&(d.defId=m);const g=d.schema;for(const v in g)delete g[v];g.$ref=p};if(e.cycles==="throw")for(const l of e.seen.entries()){const d=l[1];if(d.cycle)throw new Error(`Cycle detected: #/${(a=d.cycle)==null?void 0:a.join("/")}/<root>

Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.`)}for(const l of e.seen.entries()){const d=l[1];if(n===l[0]){o(l);continue}if(e.external){const m=(c=e.external.registry.get(l[0]))==null?void 0:c.id;if(n!==l[0]&&m){o(l);continue}}if((u=e.metadataRegistry.get(l[0]))==null?void 0:u.id){o(l);continue}if(d.cycle){o(l);continue}if(d.count>1&&e.reused==="ref"){o(l);continue}}}function ri(e,n){var s,a,c;const t=e.seen.get(n);if(!t)throw new Error("Unprocessed schema. This is a bug in Zod.");const r=u=>{const l=e.seen.get(u);if(l.ref===null)return;const d=l.def??l.schema,p={...d},m=l.ref;if(l.ref=null,m){r(m);const v=e.seen.get(m),y=v.schema;if(y.$ref&&(e.target==="draft-07"||e.target==="draft-04"||e.target==="openapi-3.0")?(d.allOf=d.allOf??[],d.allOf.push(y)):Object.assign(d,y),Object.assign(d,p),u._zod.parent===m)for(const A in d)A==="$ref"||A==="allOf"||A in p||delete d[A];if(y.$ref&&v.def)for(const A in d)A==="$ref"||A==="allOf"||A in v.def&&JSON.stringify(d[A])===JSON.stringify(v.def[A])&&delete d[A]}const g=u._zod.parent;if(g&&g!==m){r(g);const v=e.seen.get(g);if(v!=null&&v.schema.$ref&&(d.$ref=v.schema.$ref,v.def))for(const y in d)y==="$ref"||y==="allOf"||y in v.def&&JSON.stringify(d[y])===JSON.stringify(v.def[y])&&delete d[y]}e.override({zodSchema:u,jsonSchema:d,path:l.path??[]})};for(const u of[...e.seen.entries()].reverse())r(u[0]);const i={};if(e.target==="draft-2020-12"?i.$schema="https://json-schema.org/draft/2020-12/schema":e.target==="draft-07"?i.$schema="http://json-schema.org/draft-07/schema#":e.target==="draft-04"?i.$schema="http://json-schema.org/draft-04/schema#":e.target,(s=e.external)!=null&&s.uri){const u=(a=e.external.registry.get(n))==null?void 0:a.id;if(!u)throw new Error("Schema is missing an `id` property");i.$id=e.external.uri(u)}Object.assign(i,t.def??t.schema);const o=((c=e.external)==null?void 0:c.defs)??{};for(const u of e.seen.entries()){const l=u[1];l.def&&l.defId&&(o[l.defId]=l.def)}e.external||Object.keys(o).length>0&&(e.target==="draft-2020-12"?i.$defs=o:i.definitions=o);try{const u=JSON.parse(JSON.stringify(i));return Object.defineProperty(u,"~standard",{value:{...n["~standard"],jsonSchema:{input:hn(n,"input",e.processors),output:hn(n,"output",e.processors)}},enumerable:!1,writable:!1}),u}catch{throw new Error("Error converting schema to JSON.")}}function j(e,n){const t=n??{seen:new Set};if(t.seen.has(e))return!1;t.seen.add(e);const r=e._zod.def;if(r.type==="transform")return!0;if(r.type==="array")return j(r.element,t);if(r.type==="set")return j(r.valueType,t);if(r.type==="lazy")return j(r.getter(),t);if(r.type==="promise"||r.type==="optional"||r.type==="nonoptional"||r.type==="nullable"||r.type==="readonly"||r.type==="default"||r.type==="prefault")return j(r.innerType,t);if(r.type==="intersection")return j(r.left,t)||j(r.right,t);if(r.type==="record"||r.type==="map")return j(r.keyType,t)||j(r.valueType,t);if(r.type==="pipe")return j(r.in,t)||j(r.out,t);if(r.type==="object"){for(const i in r.shape)if(j(r.shape[i],t))return!0;return!1}if(r.type==="union"){for(const i of r.options)if(j(i,t))return!0;return!1}if(r.type==="tuple"){for(const i of r.items)if(j(i,t))return!0;return!!(r.rest&&j(r.rest,t))}return!1}const Al=(e,n={})=>t=>{const r=ni({...t,processors:n});return P(e,r),ti(r,e),ri(r,e)},hn=(e,n,t={})=>r=>{const{libraryOptions:i,target:o}=r??{},s=ni({...i??{},target:o,io:n,processors:t});return P(e,s),ti(s,e),ri(s,e)},Tl={guid:"uuid",url:"uri",datetime:"date-time",json_string:"json-string",regex:""},Il=(e,n,t,r)=>{const i=t;i.type="string";const{minimum:o,maximum:s,format:a,patterns:c,contentEncoding:u}=e._zod.bag;if(typeof o=="number"&&(i.minLength=o),typeof s=="number"&&(i.maxLength=s),a&&(i.format=Tl[a]??a,i.format===""&&delete i.format,a==="time"&&delete i.format),u&&(i.contentEncoding=u),c&&c.size>0){const l=[...c];l.length===1?i.pattern=l[0].source:l.length>1&&(i.allOf=[...l.map(d=>({...n.target==="draft-07"||n.target==="draft-04"||n.target==="openapi-3.0"?{type:"string"}:{},pattern:d.source}))])}},Ol=(e,n,t,r)=>{const i=t,{minimum:o,maximum:s,format:a,multipleOf:c,exclusiveMaximum:u,exclusiveMinimum:l}=e._zod.bag;typeof a=="string"&&a.includes("int")?i.type="integer":i.type="number",typeof l=="number"&&(n.target==="draft-04"||n.target==="openapi-3.0"?(i.minimum=l,i.exclusiveMinimum=!0):i.exclusiveMinimum=l),typeof o=="number"&&(i.minimum=o,typeof l=="number"&&n.target!=="draft-04"&&(l>=o?delete i.minimum:delete i.exclusiveMinimum)),typeof u=="number"&&(n.target==="draft-04"||n.target==="openapi-3.0"?(i.maximum=u,i.exclusiveMaximum=!0):i.exclusiveMaximum=u),typeof s=="number"&&(i.maximum=s,typeof u=="number"&&n.target!=="draft-04"&&(u<=s?delete i.maximum:delete i.exclusiveMaximum)),typeof c=="number"&&(i.multipleOf=c)},Rl=(e,n,t,r)=>{t.type="boolean"},Nl=(e,n,t,r)=>{t.not={}},Dl=(e,n,t,r)=>{},bl=(e,n,t,r)=>{},wl=(e,n,t,r)=>{const i=e._zod.def,o=Fr(i.entries);o.every(s=>typeof s=="number")&&(t.type="number"),o.every(s=>typeof s=="string")&&(t.type="string"),t.enum=o},kl=(e,n,t,r)=>{const i=e._zod.def,o=[];for(const s of i.values)if(s===void 0){if(n.unrepresentable==="throw")throw new Error("Literal `undefined` cannot be represented in JSON Schema")}else if(typeof s=="bigint"){if(n.unrepresentable==="throw")throw new Error("BigInt literals cannot be represented in JSON Schema");o.push(Number(s))}else o.push(s);if(o.length!==0)if(o.length===1){const s=o[0];t.type=s===null?"null":typeof s,n.target==="draft-04"||n.target==="openapi-3.0"?t.enum=[s]:t.const=s}else o.every(s=>typeof s=="number")&&(t.type="number"),o.every(s=>typeof s=="string")&&(t.type="string"),o.every(s=>typeof s=="boolean")&&(t.type="boolean"),o.every(s=>s===null)&&(t.type="null"),t.enum=o},Ll=(e,n,t,r)=>{if(n.unrepresentable==="throw")throw new Error("Custom types cannot be represented in JSON Schema")},xl=(e,n,t,r)=>{if(n.unrepresentable==="throw")throw new Error("Transforms cannot be represented in JSON Schema")},Fl=(e,n,t,r)=>{const i=t,o=e._zod.def,{minimum:s,maximum:a}=e._zod.bag;typeof s=="number"&&(i.minItems=s),typeof a=="number"&&(i.maxItems=a),i.type="array",i.items=P(o.element,n,{...r,path:[...r.path,"items"]})},$l=(e,n,t,r)=>{var u;const i=t,o=e._zod.def;i.type="object",i.properties={};const s=o.shape;for(const l in s)i.properties[l]=P(s[l],n,{...r,path:[...r.path,"properties",l]});const a=new Set(Object.keys(s)),c=new Set([...a].filter(l=>{const d=o.shape[l]._zod;return n.io==="input"?d.optin===void 0:d.optout===void 0}));c.size>0&&(i.required=Array.from(c)),((u=o.catchall)==null?void 0:u._zod.def.type)==="never"?i.additionalProperties=!1:o.catchall?o.catchall&&(i.additionalProperties=P(o.catchall,n,{...r,path:[...r.path,"additionalProperties"]})):n.io==="output"&&(i.additionalProperties=!1)},Pl=(e,n,t,r)=>{const i=e._zod.def,o=i.inclusive===!1,s=i.options.map((a,c)=>P(a,n,{...r,path:[...r.path,o?"oneOf":"anyOf",c]}));o?t.oneOf=s:t.anyOf=s},Ml=(e,n,t,r)=>{const i=e._zod.def,o=P(i.left,n,{...r,path:[...r.path,"allOf",0]}),s=P(i.right,n,{...r,path:[...r.path,"allOf",1]}),a=u=>"allOf"in u&&Object.keys(u).length===1,c=[...a(o)?o.allOf:[o],...a(s)?s.allOf:[s]];t.allOf=c},Ul=(e,n,t,r)=>{const i=t,o=e._zod.def;i.type="object";const s=o.keyType,a=s._zod.bag,c=a==null?void 0:a.patterns;if(o.mode==="loose"&&c&&c.size>0){const l=P(o.valueType,n,{...r,path:[...r.path,"patternProperties","*"]});i.patternProperties={};for(const d of c)i.patternProperties[d.source]=l}else(n.target==="draft-07"||n.target==="draft-2020-12")&&(i.propertyNames=P(o.keyType,n,{...r,path:[...r.path,"propertyNames"]})),i.additionalProperties=P(o.valueType,n,{...r,path:[...r.path,"additionalProperties"]});const u=s._zod.values;if(u){const l=[...u].filter(d=>typeof d=="string"||typeof d=="number");l.length>0&&(i.required=l)}},Zl=(e,n,t,r)=>{const i=e._zod.def,o=P(i.innerType,n,r),s=n.seen.get(e);n.target==="openapi-3.0"?(s.ref=i.innerType,t.nullable=!0):t.anyOf=[o,{type:"null"}]},zl=(e,n,t,r)=>{const i=e._zod.def;P(i.innerType,n,r);const o=n.seen.get(e);o.ref=i.innerType},Vl=(e,n,t,r)=>{const i=e._zod.def;P(i.innerType,n,r);const o=n.seen.get(e);o.ref=i.innerType,t.default=JSON.parse(JSON.stringify(i.defaultValue))},Hl=(e,n,t,r)=>{const i=e._zod.def;P(i.innerType,n,r);const o=n.seen.get(e);o.ref=i.innerType,n.io==="input"&&(t._prefault=JSON.parse(JSON.stringify(i.defaultValue)))},ql=(e,n,t,r)=>{const i=e._zod.def;P(i.innerType,n,r);const o=n.seen.get(e);o.ref=i.innerType;let s;try{s=i.catchValue(void 0)}catch{throw new Error("Dynamic catch values are not supported in JSON Schema")}t.default=s},Gl=(e,n,t,r)=>{const i=e._zod.def,o=n.io==="input"?i.in._zod.def.type==="transform"?i.out:i.in:i.out;P(o,n,r);const s=n.seen.get(e);s.ref=o},jl=(e,n,t,r)=>{const i=e._zod.def;P(i.innerType,n,r);const o=n.seen.get(e);o.ref=i.innerType,t.readOnly=!0},ii=(e,n,t,r)=>{const i=e._zod.def;P(i.innerType,n,r);const o=n.seen.get(e);o.ref=i.innerType},Bl=h("ZodISODateTime",(e,n)=>{Gc.init(e,n),L.init(e,n)});function Yl(e){return Xu(Bl,e)}const Kl=h("ZodISODate",(e,n)=>{jc.init(e,n),L.init(e,n)});function Wl(e){return Qu(Kl,e)}const Jl=h("ZodISOTime",(e,n)=>{Bc.init(e,n),L.init(e,n)});function Xl(e){return el(Jl,e)}const Ql=h("ZodISODuration",(e,n)=>{Yc.init(e,n),L.init(e,n)});function ed(e){return nl(Ql,e)}const oi=(e,n)=>{Ur.init(e,n),e.name="ZodError",Object.defineProperties(e,{format:{value:t=>Ma(e,t)},flatten:{value:t=>Pa(e,t)},addIssue:{value:t=>{e.issues.push(t),e.message=JSON.stringify(e.issues,Un,2)}},addIssues:{value:t=>{e.issues.push(...t),e.message=JSON.stringify(e.issues,Un,2)}},isEmpty:{get(){return e.issues.length===0}}})},Nv=h("ZodError",oi),oe=h("ZodError",oi,{Parent:Error}),nd=st(oe),td=at(oe),rd=Tn(oe),id=In(oe),od=za(oe),sd=Va(oe),ad=Ha(oe),cd=qa(oe),ud=Ga(oe),ld=ja(oe),dd=Ba(oe),fd=Ya(oe),k=h("ZodType",(e,n)=>(b.init(e,n),Object.assign(e["~standard"],{jsonSchema:{input:hn(e,"input"),output:hn(e,"output")}}),e.toJSONSchema=Al(e,{}),e.def=n,e.type=n.type,Object.defineProperty(e,"_def",{value:n}),e.check=(...t)=>e.clone(ve(n,{checks:[...n.checks??[],...t.map(r=>typeof r=="function"?{_zod:{check:r,def:{check:"custom"},onattach:[]}}:r)]}),{parent:!0}),e.with=e.check,e.clone=(t,r)=>Ee(e,t,r),e.brand=()=>e,e.register=(t,r)=>(t.add(e,r),e),e.parse=(t,r)=>nd(e,t,r,{callee:e.parse}),e.safeParse=(t,r)=>rd(e,t,r),e.parseAsync=async(t,r)=>td(e,t,r,{callee:e.parseAsync}),e.safeParseAsync=async(t,r)=>id(e,t,r),e.spa=e.safeParseAsync,e.encode=(t,r)=>od(e,t,r),e.decode=(t,r)=>sd(e,t,r),e.encodeAsync=async(t,r)=>ad(e,t,r),e.decodeAsync=async(t,r)=>cd(e,t,r),e.safeEncode=(t,r)=>ud(e,t,r),e.safeDecode=(t,r)=>ld(e,t,r),e.safeEncodeAsync=async(t,r)=>dd(e,t,r),e.safeDecodeAsync=async(t,r)=>fd(e,t,r),e.refine=(t,r)=>e.check(lf(t,r)),e.superRefine=t=>e.check(df(t)),e.overwrite=t=>e.check(Me(t)),e.optional=()=>Jt(e),e.exactOptional=()=>Wd(e),e.nullable=()=>Xt(e),e.nullish=()=>Jt(Xt(e)),e.nonoptional=t=>tf(e,t),e.array=()=>ie(e),e.or=t=>zd([e,t]),e.and=t=>Hd(e,t),e.transform=t=>Qt(e,Yd(t)),e.default=t=>Qd(e,t),e.prefault=t=>nf(e,t),e.catch=t=>of(e,t),e.pipe=t=>Qt(e,t),e.readonly=()=>cf(e),e.describe=t=>{const r=e.clone();return Ge.add(r,{description:t}),r},Object.defineProperty(e,"description",{get(){var t;return(t=Ge.get(e))==null?void 0:t.description},configurable:!0}),e.meta=(...t)=>{if(t.length===0)return Ge.get(e);const r=e.clone();return Ge.add(r,t[0]),r},e.isOptional=()=>e.safeParse(void 0).success,e.isNullable=()=>e.safeParse(null).success,e.apply=t=>t(e),e)),si=h("_ZodString",(e,n)=>{ct.init(e,n),k.init(e,n),e._zod.processJSONSchema=(r,i,o)=>Il(e,r,i);const t=e._zod.bag;e.format=t.format??null,e.minLength=t.minimum??null,e.maxLength=t.maximum??null,e.regex=(...r)=>e.check(cl(...r)),e.includes=(...r)=>e.check(dl(...r)),e.startsWith=(...r)=>e.check(fl(...r)),e.endsWith=(...r)=>e.check(pl(...r)),e.min=(...r)=>e.check(mn(...r)),e.max=(...r)=>e.check(Qr(...r)),e.length=(...r)=>e.check(ei(...r)),e.nonempty=(...r)=>e.check(mn(1,...r)),e.lowercase=r=>e.check(ul(r)),e.uppercase=r=>e.check(ll(r)),e.trim=()=>e.check(hl()),e.normalize=(...r)=>e.check(ml(...r)),e.toLowerCase=()=>e.check(_l()),e.toUpperCase=()=>e.check(gl()),e.slugify=()=>e.check(Sl())}),pd=h("ZodString",(e,n)=>{ct.init(e,n),si.init(e,n),e.email=t=>e.check(wu(md,t)),e.url=t=>e.check($u(hd,t)),e.jwt=t=>e.check(Ju(bd,t)),e.emoji=t=>e.check(Pu(_d,t)),e.guid=t=>e.check(Ht(Bt,t)),e.uuid=t=>e.check(ku(cn,t)),e.uuidv4=t=>e.check(Lu(cn,t)),e.uuidv6=t=>e.check(xu(cn,t)),e.uuidv7=t=>e.check(Fu(cn,t)),e.nanoid=t=>e.check(Mu(gd,t)),e.guid=t=>e.check(Ht(Bt,t)),e.cuid=t=>e.check(Uu(Sd,t)),e.cuid2=t=>e.check(Zu(vd,t)),e.ulid=t=>e.check(zu(Ed,t)),e.base64=t=>e.check(Yu(Rd,t)),e.base64url=t=>e.check(Ku(Nd,t)),e.xid=t=>e.check(Vu(yd,t)),e.ksuid=t=>e.check(Hu(Cd,t)),e.ipv4=t=>e.check(qu(Ad,t)),e.ipv6=t=>e.check(Gu(Td,t)),e.cidrv4=t=>e.check(ju(Id,t)),e.cidrv6=t=>e.check(Bu(Od,t)),e.e164=t=>e.check(Wu(Dd,t)),e.datetime=t=>e.check(Yl(t)),e.date=t=>e.check(Wl(t)),e.time=t=>e.check(Xl(t)),e.duration=t=>e.check(ed(t))});function ln(e){return bu(pd,e)}const L=h("ZodStringFormat",(e,n)=>{w.init(e,n),si.init(e,n)}),md=h("ZodEmail",(e,n)=>{$c.init(e,n),L.init(e,n)}),Bt=h("ZodGUID",(e,n)=>{xc.init(e,n),L.init(e,n)}),cn=h("ZodUUID",(e,n)=>{Fc.init(e,n),L.init(e,n)}),hd=h("ZodURL",(e,n)=>{Pc.init(e,n),L.init(e,n)}),_d=h("ZodEmoji",(e,n)=>{Mc.init(e,n),L.init(e,n)}),gd=h("ZodNanoID",(e,n)=>{Uc.init(e,n),L.init(e,n)}),Sd=h("ZodCUID",(e,n)=>{Zc.init(e,n),L.init(e,n)}),vd=h("ZodCUID2",(e,n)=>{zc.init(e,n),L.init(e,n)}),Ed=h("ZodULID",(e,n)=>{Vc.init(e,n),L.init(e,n)}),yd=h("ZodXID",(e,n)=>{Hc.init(e,n),L.init(e,n)}),Cd=h("ZodKSUID",(e,n)=>{qc.init(e,n),L.init(e,n)}),Ad=h("ZodIPv4",(e,n)=>{Kc.init(e,n),L.init(e,n)}),Td=h("ZodIPv6",(e,n)=>{Wc.init(e,n),L.init(e,n)}),Id=h("ZodCIDRv4",(e,n)=>{Jc.init(e,n),L.init(e,n)}),Od=h("ZodCIDRv6",(e,n)=>{Xc.init(e,n),L.init(e,n)}),Rd=h("ZodBase64",(e,n)=>{Qc.init(e,n),L.init(e,n)}),Nd=h("ZodBase64URL",(e,n)=>{nu.init(e,n),L.init(e,n)}),Dd=h("ZodE164",(e,n)=>{tu.init(e,n),L.init(e,n)}),bd=h("ZodJWT",(e,n)=>{iu.init(e,n),L.init(e,n)}),ai=h("ZodNumber",(e,n)=>{Kr.init(e,n),k.init(e,n),e._zod.processJSONSchema=(r,i,o)=>Ol(e,r,i),e.gt=(r,i)=>e.check(Gt(r,i)),e.gte=(r,i)=>e.check(wn(r,i)),e.min=(r,i)=>e.check(wn(r,i)),e.lt=(r,i)=>e.check(qt(r,i)),e.lte=(r,i)=>e.check(bn(r,i)),e.max=(r,i)=>e.check(bn(r,i)),e.int=r=>e.check(Yt(r)),e.safe=r=>e.check(Yt(r)),e.positive=r=>e.check(Gt(0,r)),e.nonnegative=r=>e.check(wn(0,r)),e.negative=r=>e.check(qt(0,r)),e.nonpositive=r=>e.check(bn(0,r)),e.multipleOf=(r,i)=>e.check(jt(r,i)),e.step=(r,i)=>e.check(jt(r,i)),e.finite=()=>e;const t=e._zod.bag;e.minValue=Math.max(t.minimum??Number.NEGATIVE_INFINITY,t.exclusiveMinimum??Number.NEGATIVE_INFINITY)??null,e.maxValue=Math.min(t.maximum??Number.POSITIVE_INFINITY,t.exclusiveMaximum??Number.POSITIVE_INFINITY)??null,e.isInt=(t.format??"").includes("int")||Number.isSafeInteger(t.multipleOf??.5),e.isFinite=!0,e.format=t.format??null});function dn(e){return tl(ai,e)}const wd=h("ZodNumberFormat",(e,n)=>{ou.init(e,n),ai.init(e,n)});function Yt(e){return rl(wd,e)}const kd=h("ZodBoolean",(e,n)=>{su.init(e,n),k.init(e,n),e._zod.processJSONSchema=(t,r,i)=>Rl(e,t,r)});function kn(e){return il(kd,e)}const Ld=h("ZodAny",(e,n)=>{au.init(e,n),k.init(e,n),e._zod.processJSONSchema=(t,r,i)=>Dl()});function xd(){return ol(Ld)}const Fd=h("ZodUnknown",(e,n)=>{cu.init(e,n),k.init(e,n),e._zod.processJSONSchema=(t,r,i)=>bl()});function Kt(){return sl(Fd)}const $d=h("ZodNever",(e,n)=>{uu.init(e,n),k.init(e,n),e._zod.processJSONSchema=(t,r,i)=>Nl(e,t,r)});function Pd(e){return al($d,e)}const Md=h("ZodArray",(e,n)=>{lu.init(e,n),k.init(e,n),e._zod.processJSONSchema=(t,r,i)=>Fl(e,t,r,i),e.element=n.element,e.min=(t,r)=>e.check(mn(t,r)),e.nonempty=t=>e.check(mn(1,t)),e.max=(t,r)=>e.check(Qr(t,r)),e.length=(t,r)=>e.check(ei(t,r)),e.unwrap=()=>e.element});function ie(e,n){return vl(Md,e,n)}const Ud=h("ZodObject",(e,n)=>{fu.init(e,n),k.init(e,n),e._zod.processJSONSchema=(t,r,i)=>$l(e,t,r,i),D(e,"shape",()=>n.shape),e.keyof=()=>J(Object.keys(e._zod.def.shape)),e.catchall=t=>e.clone({...e._zod.def,catchall:t}),e.passthrough=()=>e.clone({...e._zod.def,catchall:Kt()}),e.loose=()=>e.clone({...e._zod.def,catchall:Kt()}),e.strict=()=>e.clone({...e._zod.def,catchall:Pd()}),e.strip=()=>e.clone({...e._zod.def,catchall:void 0}),e.extend=t=>ka(e,t),e.safeExtend=t=>La(e,t),e.merge=t=>xa(e,t),e.pick=t=>ba(e,t),e.omit=t=>wa(e,t),e.partial=(...t)=>Fa(ci,e,t[0]),e.required=(...t)=>$a(ui,e,t[0])});function ae(e,n){const t={type:"object",shape:e??{},...I(n)};return new Ud(t)}const Zd=h("ZodUnion",(e,n)=>{pu.init(e,n),k.init(e,n),e._zod.processJSONSchema=(t,r,i)=>Pl(e,t,r,i),e.options=n.options});function zd(e,n){return new Zd({type:"union",options:e,...I(n)})}const Vd=h("ZodIntersection",(e,n)=>{mu.init(e,n),k.init(e,n),e._zod.processJSONSchema=(t,r,i)=>Ml(e,t,r,i)});function Hd(e,n){return new Vd({type:"intersection",left:e,right:n})}const qd=h("ZodRecord",(e,n)=>{hu.init(e,n),k.init(e,n),e._zod.processJSONSchema=(t,r,i)=>Ul(e,t,r,i),e.keyType=n.keyType,e.valueType=n.valueType});function Gd(e,n,t){return new qd({type:"record",keyType:e,valueType:n,...I(t)})}const zn=h("ZodEnum",(e,n)=>{_u.init(e,n),k.init(e,n),e._zod.processJSONSchema=(r,i,o)=>wl(e,r,i),e.enum=n.entries,e.options=Object.values(n.entries);const t=new Set(Object.keys(n.entries));e.extract=(r,i)=>{const o={};for(const s of r)if(t.has(s))o[s]=n.entries[s];else throw new Error(`Key ${s} not found in enum`);return new zn({...n,checks:[],...I(i),entries:o})},e.exclude=(r,i)=>{const o={...n.entries};for(const s of r)if(t.has(s))delete o[s];else throw new Error(`Key ${s} not found in enum`);return new zn({...n,checks:[],...I(i),entries:o})}});function J(e,n){const t=Array.isArray(e)?Object.fromEntries(e.map(r=>[r,r])):e;return new zn({type:"enum",entries:t,...I(n)})}const jd=h("ZodLiteral",(e,n)=>{gu.init(e,n),k.init(e,n),e._zod.processJSONSchema=(t,r,i)=>kl(e,t,r),e.values=new Set(n.values),Object.defineProperty(e,"value",{get(){if(n.values.length>1)throw new Error("This schema contains multiple valid literal values. Use `.values` instead.");return n.values[0]}})});function Wt(e,n){return new jd({type:"literal",values:Array.isArray(e)?e:[e],...I(n)})}const Bd=h("ZodTransform",(e,n)=>{Su.init(e,n),k.init(e,n),e._zod.processJSONSchema=(t,r,i)=>xl(e,t),e._zod.parse=(t,r)=>{if(r.direction==="backward")throw new Lr(e.constructor.name);t.addIssue=o=>{if(typeof o=="string")t.issues.push(Ke(o,t.value,n));else{const s=o;s.fatal&&(s.continue=!1),s.code??(s.code="custom"),s.input??(s.input=t.value),s.inst??(s.inst=e),t.issues.push(Ke(s))}};const i=n.transform(t.value,t);return i instanceof Promise?i.then(o=>(t.value=o,t)):(t.value=i,t)}});function Yd(e){return new Bd({type:"transform",transform:e})}const ci=h("ZodOptional",(e,n)=>{Xr.init(e,n),k.init(e,n),e._zod.processJSONSchema=(t,r,i)=>ii(e,t,r,i),e.unwrap=()=>e._zod.def.innerType});function Jt(e){return new ci({type:"optional",innerType:e})}const Kd=h("ZodExactOptional",(e,n)=>{vu.init(e,n),k.init(e,n),e._zod.processJSONSchema=(t,r,i)=>ii(e,t,r,i),e.unwrap=()=>e._zod.def.innerType});function Wd(e){return new Kd({type:"optional",innerType:e})}const Jd=h("ZodNullable",(e,n)=>{Eu.init(e,n),k.init(e,n),e._zod.processJSONSchema=(t,r,i)=>Zl(e,t,r,i),e.unwrap=()=>e._zod.def.innerType});function Xt(e){return new Jd({type:"nullable",innerType:e})}const Xd=h("ZodDefault",(e,n)=>{yu.init(e,n),k.init(e,n),e._zod.processJSONSchema=(t,r,i)=>Vl(e,t,r,i),e.unwrap=()=>e._zod.def.innerType,e.removeDefault=e.unwrap});function Qd(e,n){return new Xd({type:"default",innerType:e,get defaultValue(){return typeof n=="function"?n():Pr(n)}})}const ef=h("ZodPrefault",(e,n)=>{Cu.init(e,n),k.init(e,n),e._zod.processJSONSchema=(t,r,i)=>Hl(e,t,r,i),e.unwrap=()=>e._zod.def.innerType});function nf(e,n){return new ef({type:"prefault",innerType:e,get defaultValue(){return typeof n=="function"?n():Pr(n)}})}const ui=h("ZodNonOptional",(e,n)=>{Au.init(e,n),k.init(e,n),e._zod.processJSONSchema=(t,r,i)=>zl(e,t,r,i),e.unwrap=()=>e._zod.def.innerType});function tf(e,n){return new ui({type:"nonoptional",innerType:e,...I(n)})}const rf=h("ZodCatch",(e,n)=>{Tu.init(e,n),k.init(e,n),e._zod.processJSONSchema=(t,r,i)=>ql(e,t,r,i),e.unwrap=()=>e._zod.def.innerType,e.removeCatch=e.unwrap});function of(e,n){return new rf({type:"catch",innerType:e,catchValue:typeof n=="function"?n:()=>n})}const sf=h("ZodPipe",(e,n)=>{Iu.init(e,n),k.init(e,n),e._zod.processJSONSchema=(t,r,i)=>Gl(e,t,r,i),e.in=n.in,e.out=n.out});function Qt(e,n){return new sf({type:"pipe",in:e,out:n})}const af=h("ZodReadonly",(e,n)=>{Ou.init(e,n),k.init(e,n),e._zod.processJSONSchema=(t,r,i)=>jl(e,t,r,i),e.unwrap=()=>e._zod.def.innerType});function cf(e){return new af({type:"readonly",innerType:e})}const uf=h("ZodCustom",(e,n)=>{Ru.init(e,n),k.init(e,n),e._zod.processJSONSchema=(t,r,i)=>Ll(e,t)});function lf(e,n={}){return El(uf,e,n)}function df(e){return yl(e)}const ff=["NameOverride","StatusModifier","SummonCondition","SummonPermission","ActionPermission","VictoryCondition","ActionOverride","SelfDestruction","TriggerRule"],pf=["when","if"],li={CAN_DRAW:"CAN_DRAW",DECK_HAS_CARD:"DECK_HAS_CARD",DECK_HAS_NAME_INCLUDES:"DECK_HAS_NAME_INCLUDES",DECK_HAS_NORMAL_MONSTER_FOR_GRAVEYARD_BANISH:"DECK_HAS_NORMAL_MONSTER_FOR_GRAVEYARD_BANISH",HAND_COUNT:"HAND_COUNT",HAND_COUNT_EXCLUDING_SELF:"HAND_COUNT_EXCLUDING_SELF",HAND_HAS_SPELL:"HAND_HAS_SPELL",GRAVEYARD_HAS_SPELL:"GRAVEYARD_HAS_SPELL",GRAVEYARD_HAS_MONSTER:"GRAVEYARD_HAS_MONSTER",GRAVEYARD_HAS_SPELL_OR_TRAP:"GRAVEYARD_HAS_SPELL_OR_TRAP",FIELD_HAS_CARD:"FIELD_HAS_CARD",FIELD_HAS_EQUIPPED_NAME_INCLUDES:"FIELD_HAS_EQUIPPED_NAME_INCLUDES",FIELD_HAS_MONSTER_WITH_RACE:"FIELD_HAS_MONSTER_WITH_RACE",FIELD_HAS_NON_EFFECT_MONSTER:"FIELD_HAS_NON_EFFECT_MONSTER",HAS_COUNTER:"HAS_COUNTER",ONCE_PER_TURN:"ONCE_PER_TURN",ONCE_PER_TURN_EFFECT:"ONCE_PER_TURN_EFFECT",LP_AT_LEAST:"LP_AT_LEAST",LP_GREATER_THAN:"LP_GREATER_THAN"},di={DRAW:"DRAW",FILL_HANDS:"FILL_HANDS",SELECT_AND_DISCARD:"SELECT_AND_DISCARD",SELECT_RETURN_SHUFFLE_DRAW:"SELECT_RETURN_SHUFFLE_DRAW",RETURN_ALL_HAND_SHUFFLE_DRAW:"RETURN_ALL_HAND_SHUFFLE_DRAW",DISCARD_ALL_HAND_END_PHASE:"DISCARD_ALL_HAND_END_PHASE",SEARCH_FROM_DECK:"SEARCH_FROM_DECK",SEARCH_FROM_DECK_BY_NAME:"SEARCH_FROM_DECK_BY_NAME",SEARCH_FROM_DECK_TOP:"SEARCH_FROM_DECK_TOP",SEARCH_MONSTER_BY_STAT:"SEARCH_MONSTER_BY_STAT",SALVAGE_FROM_GRAVEYARD:"SALVAGE_FROM_GRAVEYARD",GAIN_LP:"GAIN_LP",PAY_LP:"PAY_LP",BURN_DAMAGE:"BURN_DAMAGE",BURN_FROM_CONTEXT:"BURN_FROM_CONTEXT",PLACE_COUNTER:"PLACE_COUNTER",REMOVE_COUNTER:"REMOVE_COUNTER",CHANGE_BATTLE_POSITION:"CHANGE_BATTLE_POSITION",SPECIAL_SUMMON_FROM_DECK:"SPECIAL_SUMMON_FROM_DECK",SPECIAL_SUMMON_FROM_DECK_BY_ATK:"SPECIAL_SUMMON_FROM_DECK_BY_ATK",SPECIAL_SUMMON_FROM_EXTRA_DECK:"SPECIAL_SUMMON_FROM_EXTRA_DECK",SPECIAL_SUMMON_FROM_CONTEXT:"SPECIAL_SUMMON_FROM_CONTEXT",CREATE_TOKEN_MONSTER:"CREATE_TOKEN_MONSTER",EXCAVATE_UNTIL_MONSTER:"EXCAVATE_UNTIL_MONSTER",EXCAVATE_UNTIL_MONSTER_WITH_LEVEL_CHECK:"EXCAVATE_UNTIL_MONSTER_WITH_LEVEL_CHECK",ESTABLISH_EQUIP:"ESTABLISH_EQUIP",SEND_EQUIPPED_AND_SELF_TO_GRAVEYARD:"SEND_EQUIPPED_AND_SELF_TO_GRAVEYARD",UNEQUIP:"UNEQUIP",RELEASE:"RELEASE",RELEASE_FOR_BURN:"RELEASE_FOR_BURN",SELECT_AND_BANISH_FROM_GRAVEYARD:"SELECT_AND_BANISH_FROM_GRAVEYARD",SPECIAL_SUMMON_FROM_BANISHED_AS_POSSIBLE:"SPECIAL_SUMMON_FROM_BANISHED_AS_POSSIBLE",SHUFFLE_DECK:"SHUFFLE_DECK",RETURN_CONTEXT_CARDS_TO_DECK_SHUFFLE:"RETURN_CONTEXT_CARDS_TO_DECK_SHUFFLE",SELECT_TARGET_FROM_FIELD_BY_RACE:"SELECT_TARGET_FROM_FIELD_BY_RACE",SELECT_TARGETS_FROM_GRAVEYARD:"SELECT_TARGETS_FROM_GRAVEYARD",SAVE_TARGETS_TO_CONTEXT:"SAVE_TARGETS_TO_CONTEXT",CLEAR_CONTEXT:"CLEAR_CONTEXT",DECLARE_RANDOM_INTEGER:"DECLARE_RANDOM_INTEGER",THEN:"THEN"},fi={FIELD_DEPARTURE_DESTINATION:"FIELD_DEPARTURE_DESTINATION"},mf=Object.values(li),hf=Object.values(di),_f=Object.values(fi),gf=J(Po),Sf=J(zo),vf=J(Vo),Ef=J(Ho),yf=J(Zo),Cf=ae({jaName:ln().min(1),type:gf,frameType:Sf,edition:J(qo).optional(),spellType:vf.optional(),trapType:Ef.optional(),monsterTypeList:ie(yf).optional(),race:ln().optional(),attribute:ln().optional(),level:dn().int().min(0).max(12).optional(),attack:dn().int().min(0).optional(),defense:dn().int().min(0).optional()}),ut=Gd(ln(),xd()).optional(),Af=J(ya),Tf=ae({events:ie(Af),timing:J(pf).optional(),isMandatory:kn().optional(),selfOnly:kn().optional(),excludeSelf:kn().optional(),sourceZones:ie(J([...Jn,...Xn,...Ar])).optional()}),If=ae({step:J(mf),args:ut}),pi=ae({trigger:Tf.optional(),requirements:ie(If).optional()}),Vn=ae({step:J(hf),args:ut}),Ln=ae({conditions:pi.optional(),spellSpeed:Wt(1).or(Wt(2)).optional(),activations:ie(Vn).optional(),resolutions:ie(Vn).optional()}),Of=J(ff),er=ae({category:Of,conditions:pi.optional(),resolutions:ie(Vn).optional(),override:J(_f).optional(),args:ut}),Rf=ae({id:dn().int().positive(),data:Cf,effectChainableActions:ae({activations:Ln.optional(),ignitions:ie(Ln).optional(),triggers:ie(Ln).optional()}).optional(),effectAdditionalRules:ae({continuous:ie(er).optional(),unclassified:ie(er).optional()}).optional()});class xn extends Error{constructor(n,t,r,i){const o=t?` (Card ID: ${t})`:"",s=r?` [Field: ${r}]`:"";super(`DSL Parse Error${o}${s}: ${n}`),this.cardId=t,this.field=r,this.cause=i,this.name="DSLParseError"}}class Nf extends Error{constructor(n,t,r,i){super(`DSL Validation Error (Card ID: ${t}, Field: ${r}): ${n}`),this.cardId=t,this.field=r,this.issues=i,this.name="DSLValidationError"}}class Z extends Error{constructor(n,t,r){super(`Argument '${n}' must be ${t}, got ${typeof r}`),this.argName=n,this.expected=t,this.actual=r,this.name="ArgValidationError"}}const S={positiveInt(e,n){const t=e[n];if(typeof t!="number"||!Number.isInteger(t)||t<1)throw new Z(n,"a positive integer",t);return t},nonNegativeInt(e,n){const t=e[n];if(typeof t!="number"||!Number.isInteger(t)||t<0)throw new Z(n,"a non-negative integer",t);return t},optionalPositiveInt(e,n){const t=e[n];if(t!==void 0){if(typeof t!="number"||!Number.isInteger(t)||t<1)throw new Z(n,"a positive integer or undefined",t);return t}},string(e,n){const t=e[n];if(typeof t!="string")throw new Z(n,"a string",t);return t},optionalString(e,n){const t=e[n];if(t!==void 0){if(typeof t!="string")throw new Z(n,"a string or undefined",t);return t}},nonEmptyString(e,n){const t=e[n];if(typeof t!="string"||t.length===0)throw new Z(n,"a non-empty string",t);return t},boolean(e,n){const t=e[n];if(typeof t!="boolean")throw new Z(n,"a boolean",t);return t},optionalBoolean(e,n,t){const r=e[n];if(r===void 0)return t;if(typeof r!="boolean")throw new Z(n,"a boolean or undefined",r);return r},oneOf(e,n,t){const r=e[n];if(typeof r!="string"||!t.includes(r)){const i=t.map(o=>`"${o}"`).join(" or ");throw new Z(n,i,r)}return r},optionalOneOf(e,n,t,r){const i=e[n];if(i===void 0)return r;if(typeof i!="string"||!t.includes(i)){const o=t.map(s=>`"${s}"`).join(" or ")+" or undefined";throw new Z(n,o,i)}return i},player(e,n){const t=e[n];if(t!=="player"&&t!=="opponent")throw new Z(n,'"player" or "opponent"',t);return t},optionalPlayer(e,n,t){const r=e[n];if(r===void 0)return t;if(r!=="player"&&r!=="opponent")throw new Z(n,'"player" or "opponent" or undefined',r);return r},optionalCardType(e,n){const t=e[n];if(t===void 0)return;if(typeof t!="string"||!["monster","spell","trap"].includes(t))throw new Z(n,'"monster", "spell", "trap", or undefined',t);return t},optionalSpellSubType(e,n){const t=e[n];if(t===void 0)return;if(typeof t!="string"||!["normal","quick-play","continuous","field","equip","ritual"].includes(t))throw new Z(n,"a valid spell sub type or undefined",t);return t},optionalStringArray(e,n){const t=e[n];if(t!==void 0){if(!Array.isArray(t)||!t.every(r=>typeof r=="string"))throw new Z(n,"an array of strings or undefined",t);return t}},optionalNumberArray(e,n){const t=e[n];if(t!==void 0){if(!Array.isArray(t)||!t.every(r=>typeof r=="number"))throw new Z(n,"an array of numbers or undefined",t);return t}}};class Le{static register(n,t){const r=this.rules.get(n)||[];this.rules.set(n,[...r,t])}static get(n){return this.rules.get(n)||[]}static getByCategory(n,t){return this.get(n).filter(i=>i.category===t)}static collectActiveRules(n,t){const r=[],i=[...n.space.spellTrapZone,...n.space.fieldZone];for(const o of i){if(!E.Instance.isFaceUp(o))continue;const s=this.getByCategory(o.id,t);for(const a of s)a.canApply(n)&&r.push(a)}return r}static collectTriggerRules(n,t){var o;const r=[],i=[...n.space.mainMonsterZone,...n.space.spellTrapZone,...n.space.fieldZone];for(const s of i){if(!E.Instance.isFaceUp(s))continue;const a=this.getByCategory(s.id,"TriggerRule");for(const c of a)(o=c.triggers)!=null&&o.includes(t)&&r.push({rule:c,sourceInstance:s})}return r}static collectTriggerSteps(n,t){const r=this.collectTriggerRules(n,t.type),i=[],o=[];for(const{rule:s,sourceInstance:a}of r){if(!s.canApply(n)||!s.createTriggerSteps||s.selfOnly&&t.sourceInstanceId!==a.instanceId||s.excludeSelf&&t.sourceInstanceId===a.instanceId||s.triggerSourceZones&&!s.triggerSourceZones.includes(t.sourceInstanceLocation))continue;const c=s.createTriggerSteps(n,a);s.isMandatory===!1?o.push({instance:a,steps:c}):i.push(...c)}return{mandatorySteps:i,optionalEffects:o}}static clear(){this.rules.clear()}static getRegisteredCardIds(){return Array.from(this.rules.keys())}}C(Le,"rules",new Map);const Df=(e,n,t)=>{if(!((n.location==="mainMonsterZone"||n.location==="spellTrapZone"||n.location==="fieldZone")&&t!=="mainMonsterZone"&&t!=="spellTrapZone"&&t!=="fieldZone"))return t;const i=Le.getByCategory(n.id,"ActionOverride");for(const o of i)if("shouldApplyOverride"in o){const s=o;if(s.shouldApplyOverride(e,n))return s.getOverrideValue()}return t};function mi(e,n,t){const r=Df(e,n,t);return _.Space.moveCard(e.space,n,r)}function bf(e){return{shouldApply(n,t,r){return!(t.id!==e||!E.Instance.isFaceUp(t))},getOverrideValue(n){return n.destination??"banished"}}}const Ye=class Ye{static register(n,t){const r={id:n,...t};this.cards.set(n,r)}static getOrUndefined(n){return this.cards.get(n)}static get(n){const t=this.cards.get(n);if(!t)throw new Error(`Card data not found in registry: ${n}.`);return t}static getCardNameWithBrackets(n){const t=this.get(n);return E.nameWithBrackets(t)}static has(n){return this.cards.has(n)}static clear(){this.cards.clear()}static getRegisteredCardIds(){return Array.from(this.cards.keys())}};C(Ye,"cards",new Map),C(Ye,"getCard",n=>Ye.get(n));let H=Ye;const lt=e=>{const n=H.getCardNameWithBrackets(e);return{id:`${e}-activation-notification`,summary:"カード発動",description:`${n}を発動します`,notificationLevel:"static",action:t=>f.Result.success(t,`${n} activated`)}},Ue=e=>({id:e.id,sourceCardId:e.sourceCardId,summary:e.summary,description:e.description,notificationLevel:"interactive",cardSelectionConfig:n=>({availableCards:e.availableCards,_sourceZone:e._sourceZone,_filter:e._filter,minCards:e.minCards,maxCards:e.dynamicMaxCards?e.dynamicMaxCards(n):e.maxCards,summary:e.summary,description:e.description,cancelable:e.cancelable??!1,canConfirm:e.dynamicCanConfirm?t=>e.dynamicCanConfirm(n,t):e.canConfirm}),action:(n,t)=>!t||t.length===0?e.onSelect(n,[]):e.onSelect(n,t)});function wf(e,n){let t=e.space;const r=[];for(const i of n){const o=_.Space.findCard(t,i);if(o){const s={...e,space:t};t=mi(s,o,"graveyard"),r.push(...ue.sentToGraveyard(o))}}return{space:t,events:r}}const dt=e=>{const n=o=>!0,t=e.filter??n,r=e.summary??"リリース対象を選択",i=e.description??`フィールドのモンスター${e.count}体をリリースします`;return Ue({id:`${e.cardId}-select-release`,sourceCardId:e.cardId,summary:r,description:i,availableCards:null,_sourceZone:"mainMonsterZone",_filter:t,minCards:e.count,maxCards:e.count,cancelable:!1,onSelect:(o,s)=>{const a=s.map(d=>_.Space.findCard(o.space,d)),{space:c,events:u}=wf(o,s),l={...o,space:c};return e.onReleased(l,a,u)}})},kf=(e,n)=>{const t=S.optionalPositiveInt(e,"count")??1,r=S.optionalBoolean(e,"excludeEffect",!1),i=s=>!(s.type!=="monster"||!E.Instance.isFaceUp(s)||r&&E.isEffectMonster(s)),o=r?"効果モンスター以外の":"";return dt({cardId:n.cardId,count:t,summary:"リリース対象を選択",description:`フィールドの${o}モンスター${t}体をリリースします`,filter:i,onReleased:(s,a,c)=>{const u=a.map(l=>l.jaName).join("、");return f.Result.success(s,`${u}をリリースしました`,c)}})},Lf=(e,n)=>{const t=e.damageMultiplier??.5,r=Math.round(t*100);if(typeof t!="number"||t<=0)throw new Error("RELEASE_FOR_BURN step requires damageMultiplier to be a positive number");if(!n.effectId)throw new Error("RELEASE_FOR_BURN step requires effectId in context");const i=n.effectId;return dt({cardId:n.cardId,count:1,summary:"リリース対象を選択",description:`フィールドのモンスター1体をリリースし、攻撃力の${r}%のダメージを与えます`,onReleased:(o,s,a)=>{const c=s[0],u=c.attack??0,l=Math.floor(u*t),d={...o,activationContexts:_.ActivationContext.setDamage(o.activationContexts,i,l)};return f.Result.success(d,`Released ${c.jaName} (ATK ${u}, ${l} damage stored)`,a)}})};function hi(e){return!e||e<=4?0:e<=6?1:2}function xf(e,n){if(!_.Phase.isMain(e.phase))return f.Validation.failure(f.Validation.ERROR_CODES.NOT_MAIN_PHASE);if(e.normalSummonUsed>=e.normalSummonLimit)return f.Validation.failure(f.Validation.ERROR_CODES.SUMMON_LIMIT_REACHED);const t=_.Space.findCard(e.space,n);if(!t)return f.Validation.failure(f.Validation.ERROR_CODES.CARD_NOT_FOUND);if(!E.isMonster(t))return f.Validation.failure(f.Validation.ERROR_CODES.NOT_MONSTER_CARD);if(!E.Instance.inHand(t))return f.Validation.failure(f.Validation.ERROR_CODES.CARD_NOT_IN_HAND);const r=hi(t.level),i=e.space.mainMonsterZone.length;if(r===0){if(_.Space.isMainMonsterZoneFull(e.space))return f.Validation.failure(f.Validation.ERROR_CODES.MONSTER_ZONE_FULL)}else if(i<r)return f.Validation.failure(f.Validation.ERROR_CODES.NOT_ENOUGH_TRIBUTES);return f.Validation.success()}function Ff(e,n,t){const r=_.Space.findCard(e.space,n),i=hi(r.level),o=t==="defense",s=o?"セット":"召喚";if(i===0){const a=nr(e,n,t),c=_.Space.findCard(a.space,n),u=o?[]:[Aa(c)];return{type:"immediate",state:a,message:`${E.nameWithBrackets(r)}を${s}します`,activationSteps:u}}else{const a=o?"アドバンスセット":"アドバンス召喚",c=dt({cardId:r.id,count:i,onReleased:(u,l,d)=>{const p=nr(u,n,t),m=_.Space.findCard(p.space,n),g=o?d:[...d,ue.normalSummoned(m)];return f.Result.success(p,`${E.nameWithBrackets(r)}を${a}しました`,g)}});return{type:"needsSelection",message:`${E.nameWithBrackets(r)}のリリース対象を選択してください`,step:c}}}function nr(e,n,t){const r=_.Space.findCard(e.space,n),i=_.Space.moveCard(e.space,r,"mainMonsterZone",{position:t==="attack"?"faceUp":"faceDown",battlePosition:t});return{...e,space:i,normalSummonUsed:e.normalSummonUsed+1}}function rn(e){return _.Space.isMainMonsterZoneFull(e.space)?f.Validation.failure(f.Validation.ERROR_CODES.MONSTER_ZONE_FULL):f.Validation.success()}function Ze(e,n,t){const r=_.Space.findCard(e.space,n),i=_.Space.moveCard(e.space,r,"mainMonsterZone",{position:"faceUp",battlePosition:t}),o={...e,space:i},s=_.Space.findCard(o.space,n);return{state:o,event:ue.specialSummoned(s)}}class un{constructor(n,t){C(this,"description");this.cardInstanceId=n,this.mode=t,this.description=t==="summon"?`Summon monster ${n}`:`Set monster ${n}`}canExecute(n){return n.result.isGameOver?f.Validation.failure(f.Validation.ERROR_CODES.GAME_OVER):xf(n,this.cardInstanceId)}execute(n){const t=this.canExecute(n);if(!t.isValid)return ne.Result.failure(n,f.Validation.errorMessage(t));const r=this.mode==="summon"?"attack":"defense",i=Ff(n,this.cardInstanceId,r);return i.type==="immediate"?ne.Result.success(i.state,i.message,void 0,i.activationSteps):ne.Result.success(n,i.message,void 0,[i.step])}getCardInstanceId(){return this.cardInstanceId}getMode(){return this.mode}}class tr{constructor(n){C(this,"description");this.cardInstanceId=n,this.description=`Set spell/trap ${n}`}canExecute(n){if(n.result.isGameOver)return f.Validation.failure(f.Validation.ERROR_CODES.GAME_OVER);if(!_.Phase.isMain(n.phase))return f.Validation.failure(f.Validation.ERROR_CODES.NOT_MAIN_PHASE);const t=_.Space.findCard(n.space,this.cardInstanceId);return t?!E.isSpell(t)&&!E.isTrap(t)?f.Validation.failure(f.Validation.ERROR_CODES.NOT_SPELL_OR_TRAP_CARD):E.Instance.inHand(t)?!E.isFieldSpell(t)&&_.Space.isSpellTrapZoneFull(n.space)?f.Validation.failure(f.Validation.ERROR_CODES.SPELL_TRAP_ZONE_FULL):f.Validation.success():f.Validation.failure(f.Validation.ERROR_CODES.CARD_NOT_IN_HAND):f.Validation.failure(f.Validation.ERROR_CODES.CARD_NOT_FOUND)}execute(n){const t=this.canExecute(n);if(!t.isValid)return ne.Result.failure(n,f.Validation.errorMessage(t));const r=_.Space.findCard(n.space,this.cardInstanceId),i={...n,space:this.moveSetSpellTrapCard(n.space,r)};return ne.Result.success(i,`${E.nameWithBrackets(r)}をセットします`)}moveSetSpellTrapCard(n,t){if(E.isFieldSpell(t)){const r=_.Space.sendExistingFieldSpellToGraveyard(n);return _.Space.moveCard(r,t,"fieldZone",{position:"faceDown"})}return _.Space.moveCard(n,t,"spellTrapZone",{position:"faceDown"})}getCardInstanceId(){return this.cardInstanceId}}function _i(e,n){if(E.Instance.inHand(n)){if(E.isFieldSpell(n)){const t=_.Space.sendExistingFieldSpellToGraveyard(e);return _.Space.moveCard(t,n,"fieldZone",{position:"faceUp"})}if(E.isSpell(n)||E.isTrap(n))return _.Space.moveCard(e,n,"spellTrapZone",{position:"faceUp"});throw new Error("Invalid card type for activation")}return _.Space.updateCardStateInPlace(e,n,{position:"faceUp"})}function $f(e,n,t){return t!==void 0?`${e}-${n}-${t}`:`${e}-${n}`}const Rn={Id:{create:$f}};class Pf{constructor(n,t,r=1){C(this,"cardId");C(this,"effectId");C(this,"effectCategory","trigger");C(this,"spellSpeed");this.cardId=n,this.spellSpeed=r,this.effectId=Rn.Id.create("trigger",n,t)}canActivate(n,t){const r=this.individualConditions(n,t);return r.isValid?f.Validation.success():r}createActivationSteps(n,t){return[lt(t.id),...this.individualActivationSteps(n,t)]}createResolutionSteps(n,t){return[...this.individualResolutionSteps(n,t)]}}function Mf(e){return e.effectCategory==="trigger"}class z{static registerActivation(n,t){const r=this.getOrCreateEntry(n);r.activation=t}static registerIgnition(n,t){this.getOrCreateEntry(n).ignitionEffects.push(t)}static registerTrigger(n,t){this.getOrCreateEntry(n).triggerEffects.push(t)}static getActivation(n){var t;return(t=this.effects.get(n))==null?void 0:t.activation}static getIgnitionEffects(n){var t;return((t=this.effects.get(n))==null?void 0:t.ignitionEffects)??[]}static hasIgnitionEffects(n){const t=this.effects.get(n);return t!==void 0&&t.ignitionEffects.length>0}static getTriggerEffects(n){var t;return((t=this.effects.get(n))==null?void 0:t.triggerEffects)??[]}static hasTriggerEffects(n){const t=this.effects.get(n);return t!==void 0&&t.triggerEffects.length>0}static collectTriggerSteps(n,t){const r=[],i=[],o=[],s=(a,c)=>{for(const u of a){if(c&&!E.Instance.isFaceUp(u))continue;const l=this.getTriggerEffects(u.id);for(const d of l){if(!Mf(d)||!d.triggers.includes(t.type)||d.selfOnly&&t.sourceInstanceId!==u.instanceId||d.excludeSelf&&t.sourceInstanceId===u.instanceId||!d.canActivate(n,u).isValid)continue;const m=d.createActivationSteps(n,u),g=d.createResolutionSteps(n,u);d.isMandatory?(i.push({sourceInstanceId:u.instanceId,sourceCardId:u.id,effectId:d.effectId,spellSpeed:d.spellSpeed,resolutionSteps:g,isNegated:!1}),r.push(...m)):o.push({instance:u,action:d,activationSteps:m,resolutionSteps:g})}}};return s(n.space.hand,!1),s(n.space.mainMonsterZone,!0),s(n.space.spellTrapZone,!0),s(n.space.fieldZone,!0),s(n.space.graveyard,!1),s(n.space.banished,!1),{mandatorySteps:r,mandatoryChainBlocks:i,optionalEffects:o}}static collectChainableActions(n,t,r=new Set){const i=[];for(const o of n.space.hand)r.has(o.instanceId)||(this.collectActivation(i,o,n,t),this.collectEffects(i,o,n,t));for(const o of n.space.mainMonsterZone)r.has(o.instanceId)||E.Instance.isFaceUp(o)&&this.collectEffects(i,o,n,t);for(const o of n.space.spellTrapZone)r.has(o.instanceId)||(E.Instance.isFaceDown(o)?this.collectActivation(i,o,n,t):this.collectEffects(i,o,n,t));for(const o of n.space.fieldZone)r.has(o.instanceId)||E.Instance.isFaceUp(o)&&this.collectEffects(i,o,n,t);for(const o of n.space.graveyard)r.has(o.instanceId)||this.collectEffects(i,o,n,t);for(const o of n.space.banished)r.has(o.instanceId)||this.collectEffects(i,o,n,t);return i}static collectActivation(n,t,r,i){const o=this.getActivation(t.id);o&&this.tryAddAction(n,t,o,r,i)}static collectEffects(n,t,r,i){for(const o of this.getIgnitionEffects(t.id))this.tryAddAction(n,t,o,r,i);for(const o of this.getTriggerEffects(t.id))this.tryAddAction(n,t,o,r,i)}static tryAddAction(n,t,r,i,o){if(r.spellSpeed<o)return;r.canActivate(i,t).isValid&&n.push({instance:t,action:r})}static clear(){this.effects.clear()}static getRegisteredCardIds(){return Array.from(this.effects.keys())}static getOrCreateEntry(n){let t=this.effects.get(n);return t||(t={ignitionEffects:[],triggerEffects:[]},this.effects.set(n,t)),t}}C(z,"effects",new Map);const Uf=new Map([]);function Zf(e){const n=Uf.get(e);n&&n()}class rr{constructor(n){C(this,"description");this.cardInstanceId=n,this.description=`Activate spell card ${n}`}canExecute(n){if(n.result.isGameOver)return f.Validation.failure(f.Validation.ERROR_CODES.GAME_OVER);const t=_.Space.findCard(n.space,this.cardInstanceId);if(!t)return f.Validation.failure(f.Validation.ERROR_CODES.CARD_NOT_FOUND);if(!E.isSpell(t))return f.Validation.failure(f.Validation.ERROR_CODES.NOT_SPELL_CARD);if(!E.Instance.inHand(t)&&!(E.Instance.onField(t)&&E.Instance.isFaceDown(t)))return f.Validation.failure(f.Validation.ERROR_CODES.CARD_NOT_IN_VALID_LOCATION);if(!E.isFieldSpell(t)&&_.Space.isSpellTrapZoneFull(n.space))return f.Validation.failure(f.Validation.ERROR_CODES.SPELL_TRAP_ZONE_FULL);const r=z.getActivation(t.id);if(!r)return f.Validation.failure(f.Validation.ERROR_CODES.EFFECT_NOT_REGISTERED);const i=r.canActivate(n,t);return i.isValid?f.Validation.success():i}execute(n){const t=this.canExecute(n);if(!t.isValid)return ne.Result.failure(n,f.Validation.errorMessage(t));const r=_.Space.findCard(n.space,this.cardInstanceId),i={...n,space:_i(n.space,r),activatedCardIds:_.updatedActivatedCardIds(n.activatedCardIds,r.id)},o=z.getActivation(r.id),s=(o==null?void 0:o.createActivationSteps(i,r))??[],a=(o==null?void 0:o.createResolutionSteps(i,r))??[],c=o?{effectId:o.effectId,sourceInstanceId:r.instanceId,sourceCardId:r.id,spellSpeed:o.spellSpeed,resolutionSteps:a,isNegated:!1}:void 0;return ne.Result.success(i,void 0,[],s,c)}getCardInstanceId(){return this.cardInstanceId}}class ir{constructor(n){C(this,"description");this.cardInstanceId=n,this.description=`Activate ignition effect of ${n}`}canExecute(n){if(n.result.isGameOver)return f.Validation.failure(f.Validation.ERROR_CODES.GAME_OVER);const t=_.Space.findCard(n.space,this.cardInstanceId);if(!t)return f.Validation.failure(f.Validation.ERROR_CODES.CARD_NOT_FOUND);if(!["fieldZone","spellTrapZone","mainMonsterZone"].includes(t.location))return f.Validation.failure(f.Validation.ERROR_CODES.CARD_NOT_ON_FIELD);if(!E.Instance.isFaceUp(t))return f.Validation.failure(f.Validation.ERROR_CODES.CARD_NOT_FACE_UP);const i=z.getIgnitionEffects(t.id);return i.length===0?f.Validation.failure(f.Validation.ERROR_CODES.NO_IGNITION_EFFECT):this.findActivatableEffect(i,n,t)?f.Validation.success():f.Validation.failure(f.Validation.ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET)}findActivatableEffect(n,t,r){return n.find(i=>i.canActivate(t,r).isValid)}execute(n){const t=this.canExecute(n);if(!t.isValid)return ne.Result.failure(n,f.Validation.errorMessage(t));const r=_.Space.findCard(n.space,this.cardInstanceId),i=z.getIgnitionEffects(r.id),o=this.findActivatableEffect(i,n,r),s=r.stateOnField,a={...n,space:_.Space.updateCardStateInPlace(n.space,r,{activatedEffects:[...s.activatedEffects,o.effectId]})},c=o.createActivationSteps(a,r),u=o.createResolutionSteps(a,r),l={effectId:o.effectId,sourceInstanceId:r.instanceId,sourceCardId:r.id,spellSpeed:o.spellSpeed,resolutionSteps:u,isNegated:!1};return ne.Result.success(a,void 0,[],c,l)}getCardInstanceId(){return this.cardInstanceId}}function zf(e,n){if(!_.Phase.isMain(e.phase))return f.Validation.failure(f.Validation.ERROR_CODES.NOT_MAIN_PHASE);const t=_.Space.findCard(e.space,n);if(!t)return f.Validation.failure(f.Validation.ERROR_CODES.CARD_NOT_FOUND);if(t.frameType!=="synchro")return f.Validation.failure("NOT_SYNCHRO_MONSTER");if(t.location!=="extraDeck")return f.Validation.failure("CARD_NOT_IN_EXTRA_DECK");const r=t.level??0;return Vf(e.space.mainMonsterZone,r)?f.Validation.success():f.Validation.failure("NO_VALID_SYNCHRO_MATERIALS")}function Vf(e,n){const t=e.filter(o=>E.Instance.isFaceUp(o)),r=t.filter(o=>E.isTuner(o)),i=t.filter(o=>E.isNonTuner(o));return r.length===0||i.length===0?!1:Hf(r,i,n)}function Hf(e,n,t){for(const r of e){const i=r.level??0,o=t-i;if(o>0&&qf(n,o))return!0}return!1}function qf(e,n){const t=e.map(i=>i.level??0),r=new Set([0]);for(const i of t){const o=new Set;for(const s of r)o.add(s+i);for(const s of o)r.add(s)}return r.has(n)}function Gf(e,n){if(e.length<2)return!1;const t=e.some(o=>E.isTuner(o)),r=e.some(o=>E.isNonTuner(o));return!t||!r?!1:e.reduce((o,s)=>o+(s.level??0),0)===n}function jf(e,n){const t=_.Space.findCard(e.space,n),r=t.level??0,i=Ue({id:`${t.id}-select-synchro-materials`,sourceCardId:t.id,summary:"シンクロ素材を選択",description:`チューナー＋非チューナーを選び、レベル合計が ${r} になるようにしてください`,availableCards:null,_sourceZone:"mainMonsterZone",_filter:o=>E.Instance.isFaceUp(o),minCards:2,maxCards:5,cancelable:!0,canConfirm:o=>Gf(o,r),onSelect:(o,s)=>{if(s.length===0)return f.Result.failure(o,"シンクロ召喚をキャンセルしました");let a=o.space;const c=[];for(const g of s){const v=_.Space.findCard(a,g);if(v){const y={...o,space:a};a=mi(y,v,"graveyard"),c.push(...ue.sentToGraveyard(v))}}const u={...o,space:a},{state:l,event:d}=Ze(u,n,"attack"),p=_.Space.findCard(l.space,n),m=[...c,d,ue.synchroSummoned(p)];return f.Result.success(l,`${E.nameWithBrackets(p)}をシンクロ召喚しました`,m)}});return{type:"needsSelection",message:`${E.nameWithBrackets(t)}のシンクロ素材を選択してください`,step:i}}class or{constructor(n){C(this,"description");this.cardInstanceId=n,this.description=`Synchro Summon ${n}`}canExecute(n){return n.result.isGameOver?f.Validation.failure(f.Validation.ERROR_CODES.GAME_OVER):zf(n,this.cardInstanceId)}execute(n){const t=this.canExecute(n);if(!t.isValid)return ne.Result.failure(n,f.Validation.errorMessage(t));const r=jf(n,this.cardInstanceId);return ne.Result.success(n,r.message,void 0,[r.step])}getCardInstanceId(){return this.cardInstanceId}}const Bf=`# 《封印されし者の右腕》 (Right Arm of the Forbidden One)

id: 70903634

data:
  jaName: "封印されし者の右腕"
  type: "monster"
  frameType: "normal"
  monsterTypeList: ["normal"]
  attribute: "DARK"
  race: "Spellcaster"
  level: 1
  attack: 200
  defense: 300
`,Yf=`# 《封印されし者の左腕》 (Left Arm of the Forbidden One)

id: 7902349

data:
  jaName: "封印されし者の左腕"
  type: "monster"
  frameType: "normal"
  monsterTypeList: ["normal"]
  attribute: "DARK"
  race: "Spellcaster"
  level: 1
  attack: 200
  defense: 300
`,Kf=`# 《封印されし者の右足》 (Right Leg of the Forbidden One)

id: 8124921

data:
  jaName: "封印されし者の右足"
  type: "monster"
  frameType: "normal"
  monsterTypeList: ["normal"]
  attribute: "DARK"
  race: "Spellcaster"
  level: 1
  attack: 200
  defense: 300
`,Wf=`# 《封印されし者の左足》 (Left Leg of the Forbidden One)

id: 44519536

data:
  jaName: "封印されし者の左足"
  type: "monster"
  frameType: "normal"
  monsterTypeList: ["normal"]
  attribute: "DARK"
  race: "Spellcaster"
  level: 1
  attack: 200
  defense: 300
`,Jf=`# 《千眼の邪教神》 (Thousand-Eyes Idol)

id: 27125110

data:
  jaName: "千眼の邪教神"
  type: "monster"
  frameType: "normal"
  monsterTypeList: ["normal"]
  attribute: "DARK"
  race: "Spellcaster"
  level: 1
  attack: 0
  defense: 0
`,Xf=`# 《ガード・オブ・フレムベル》 (Flamvell Guard)

id: 21615956

data:
  jaName: "ガード・オブ・フレムベル"
  type: "monster"
  frameType: "normal"
  monsterTypeList: ["normal", "tuner"]
  attribute: "FIRE"
  race: "Dragon"
  level: 1
  attack: 100
  defense: 2000
`,Qf=`# 《スペース・オマジナイ・ウサギ》 (Lunar Rabbit Omajinai)

id: 47643326

data:
  jaName: "スペース・オマジナイ・ウサギ"
  type: "monster"
  frameType: "normal"
  monsterTypeList: ["normal", "tuner"]
  attribute: "LIGHT"
  race: "Spellcaster"
  level: 1
  attack: 0
  defense: 1500
`,ep=`# 《封印されしエクゾディア》 (Exodia the Forbidden One)
#
# 効果外テキスト:
# - エクゾディアパーツが全て手札に揃った時、デュエルに勝利する
#
# Note: 特殊勝利は DSL の対象外のため、yamlに定義していない

id: 33396948

data:
  jaName: "封印されしエクゾディア"
  type: "monster"
  frameType: "effect"
  monsterTypeList: ["effect"]
  attribute: "DARK"
  race: "Spellcaster"
  level: 3
  attack: 1000
  defense: 1000
`,np=`# 《王立魔法図書館》 (Royal Magical Library)
#
# 永続効果:
# - 魔法カードが発動する度に、このカードに魔力カウンターを1つ置く（最大3つまで）
#
# 起動効果:
# - CONDITIONS: 魔力カウンターが3つ以上
# - ACTIVATIONS: 魔力カウンターを3つ取り除く
# - RESOLUTIONS: 1枚ドロー

id: 70791313

data:
  jaName: "王立魔法図書館"
  type: "monster"
  frameType: "effect"
  monsterTypeList: ["effect"]
  attribute: "LIGHT"
  race: "Spellcaster"
  level: 4
  attack: 0
  defense: 2000

effectAdditionalRules:
  continuous:
    - category: "TriggerRule"
      conditions:
        trigger:
          events: ["spellActivated"]
          timing: "if"
          isMandatory: true
      resolutions:
        - step: "PLACE_COUNTER"
          args: { counterType: "spell", count: 1, limit: 3 }

effectChainableActions:
  ignitions:
    - conditions:
        requirements:
          - step: "HAS_COUNTER"
            args: { counterType: "spell", minCount: 3 }
      activations:
        - step: "REMOVE_COUNTER"
          args: { counterType: "spell", count: 3 }
      resolutions:
        - step: "DRAW"
          args: { count: 1 }
`,tp=`# 《召喚僧サモンプリースト》 (Summoner Monk)
#
# 永続効果:
# - このカードはリリースできない（未実装）
#
# 誘発効果:
# - CONDITIONS: このカードが召喚に成功した場合
# - ACTIVATIONS: 無し
# - RESOLUTIONS: このカードを守備表示にする
#
# 起動効果:
# - CONDITIONS: 1ターンに1度制限、捨てられる魔法カードが1枚以上
# - ACTIVATIONS: 手札から魔法カード1枚を捨てる
# - RESOLUTIONS: デッキからレベル4モンスター1体を特殊召喚
#
# Note: 反転召喚時の誘発効果、特殊召喚したモンスターがこのターン攻撃できない制約は未実装

id: 423585

data:
  jaName: "召喚僧サモンプリースト"
  type: "monster"
  frameType: "effect"
  monsterTypeList: ["effect"]
  attribute: "DARK"
  race: "Spellcaster"
  level: 4
  attack: 800
  defense: 1600

effectChainableActions:
  triggers:
    - conditions:
        trigger:
          events: ["normalSummoned"]
          timing: "if"
          isMandatory: true
          selfOnly: true
      spellSpeed: 1
      resolutions:
        - step: "CHANGE_BATTLE_POSITION"
          args: { position: "defense" }
  ignitions:
    - conditions:
        requirements:
          - step: "ONCE_PER_TURN_EFFECT"
            args: { effectIndex: 1 }
          - step: "HAND_HAS_SPELL"
            args: { minCount: 1 }
      activations:
        - step: "SELECT_AND_DISCARD"
          args: { count: 1, filterType: "spell" }
      resolutions:
        - step: "SPECIAL_SUMMON_FROM_DECK"
          args: { filterType: "monster", filterLevel: 4, count: 1 }
`,rp=`# 《クリッター》 (Sangan)
#
# 誘発効果:
# - CONDITIONS: このカードが墓地へ送られた時
# - ACTIVATIONS: 無し
# - RESOLUTIONS: デッキから攻撃力1500以下のモンスター1体を手札に加える
#
# Note: レガシー版（エラッタ前）
# - 1ターンに1度制限なし
# - フィールド以外から墓地の送られても発動可能
# - サーチしたカードの発動制限なし

id: 26202165

data:
  jaName: "クリッター"
  type: "monster"
  frameType: "effect"
  monsterTypeList: ["effect"]
  edition: "legacy"
  attribute: "DARK"
  race: "Fiend"
  level: 3
  attack: 1000
  defense: 600

effectChainableActions:
  triggers:
    - conditions:
        trigger:
          events: ["sentToGraveyard"]
          timing: "when"
          isMandatory: true
          selfOnly: true
      resolutions:
        - step: "SEARCH_MONSTER_BY_STAT"
          args: { statType: "attack", maxValue: 1500, count: 1 }
`,ip=`# 《黒き森のウィッチ》 (Witch of the Black Forest)
#
# 誘発効果:
# - CONDITIONS: このカードが墓地へ送られた時
# - ACTIVATIONS: 無し
# - RESOLUTIONS: デッキから守備力1500以下のモンスター1体を手札に加える
#
# Note: レガシー版（エラッタ前）
# - 1ターンに1度制限なし
# - フィールド以外から墓地の送られても発動可能
# - サーチしたカードの発動制限なし

id: 78010363

data:
  jaName: "黒き森のウィッチ"
  type: "monster"
  frameType: "effect"
  monsterTypeList: ["effect"]
  edition: "legacy"
  attribute: "DARK"
  race: "Spellcaster"
  level: 4
  attack: 1100
  defense: 1200

effectChainableActions:
  triggers:
    - conditions:
        trigger:
          events: ["sentToGraveyard"]
          timing: "when"
          isMandatory: true
          selfOnly: true
      resolutions:
        - step: "SEARCH_MONSTER_BY_STAT"
          args: { statType: "defense", maxValue: 1500, count: 1 }
`,op=`# 《魔導サイエンティスト》 (Magical Scientist)
#
# 起動効果:
# - CONDITIONS: LP>1000
# - ACTIVATIONS: 1000LP支払い
# - RESOLUTIONS: レベル6以下の融合モンスター1体をEXデッキから特殊召喚
#
# Note: 特殊召喚したモンスターが直接攻撃できない制約、ターン終了時にEXデッキに戻る処理は未実装

id: 34206604

data:
  jaName: "魔導サイエンティスト"
  type: "monster"
  frameType: "effect"
  monsterTypeList: ["effect"]
  attribute: "DARK"
  race: "Spellcaster"
  level: 1
  attack: 300
  defense: 300

effectChainableActions:
  ignitions:
    - conditions:
        requirements:
          - step: "LP_GREATER_THAN"
            args: { amount: 1000 }
      activations:
        - step: "PAY_LP"
          args: { amount: 1000 }
      resolutions:
        - step: "SPECIAL_SUMMON_FROM_EXTRA_DECK"
          args: { filterMaxLevel: 6, filterFrameType: "fusion" }
`,sp=`# 《カタパルト・タートル》 (Catapult Turtle)
#
# 起動効果:
# - CONDITIONS: なし（レガシー版: 1ターンに1度制限なし）
# - ACTIVATIONS: 自分フィールドのモンスター1体をリリース
# - RESOLUTIONS: リリースしたモンスターの攻撃力の半分のバーンダメージ
#
# Note: 自身をリリースできるため、CONDITIONSでのモンスター存在チェックは不要

id: 95727991

data:
  jaName: "カタパルト・タートル"
  type: "monster"
  frameType: "effect"
  monsterTypeList: ["effect"]
  edition: "legacy"
  attribute: "WATER"
  race: "Aqua"
  level: 5
  attack: 1000
  defense: 2000

effectChainableActions:
  ignitions:
    - activations:
        - step: "RELEASE_FOR_BURN"
          args: { damageMultiplier: 0.5 }
      resolutions:
        - step: "BURN_FROM_CONTEXT"
          args: { damageTarget: "opponent" }
`,ap=`# 《トゥーン・キャノン・ソルジャー》 (Toon Cannon Soldier)
#
# 起動効果:
# - CONDITIONS: 無し
# - ACTIVATIONS: 自分フィールド上のモンスター1体をリリース
# - RESOLUTIONS: 500のバーンダメージ
#
# 永続効果:
# - フィールド上の「トゥーン・ワールド」が破壊された時、自壊（未実装）
#
# Note:
# - 自身をリリースできるため、CONDITIONSでのモンスター存在チェックは不要
# - 召喚・反転召喚・特殊召喚したターンに攻撃できない制約は未実装
# - 直接攻撃できる効果は未実装

id: 79875176

data:
  jaName: "トゥーン・キャノン・ソルジャー"
  type: "monster"
  frameType: "effect"
  monsterTypeList: ["effect", "toon"]
  attribute: "DARK"
  race: "Machine"
  level: 4
  attack: 1400
  defense: 1300

effectChainableActions:
  ignitions:
    - activations:
        - step: "RELEASE"
          args: { count: 1 }
      resolutions:
        - step: "BURN_DAMAGE"
          args: { amount: 500 }
`,cp=`# 《トレジャー・パンダー》 (Treasure Panda)
#
# 起動効果:
# - CONDITIONS: 墓地に魔法・罠カードが存在、デッキに墓地枚数(上限3)以内のレベルに対応する通常モンスターが存在
# - ACTIVATIONS: 墓地から魔法・罠カードを3枚まで裏側除外
# - RESOLUTIONS: 除外したカードの数と同じレベルの通常モンスター1体をデッキから特殊召喚

id: 45221020

data:
  jaName: "トレジャー・パンダー"
  type: "monster"
  frameType: "effect"
  monsterTypeList: ["effect"]
  attribute: "EARTH"
  race: "Beast"
  level: 4
  attack: 1100
  defense: 2000

effectChainableActions:
  ignitions:
    - conditions:
        requirements:
          - step: "GRAVEYARD_HAS_SPELL_OR_TRAP"
            args: { minCount: 1 }
          - step: "DECK_HAS_NORMAL_MONSTER_FOR_GRAVEYARD_BANISH"
            args: { maxCount: 3 }
      activations:
        - step: "SELECT_AND_BANISH_FROM_GRAVEYARD"
          args:
            {
              minCount: 1,
              maxCount: 3,
              filterType: "spell_or_trap",
              faceDown: true,
              dynamicMaxCount: "deck_normal_monster_max_level",
            }
      resolutions:
        - step: "SPECIAL_SUMMON_FROM_DECK"
          args: { filterType: "normal_monster", filterLevel: "paidCosts", count: 1 }
`,up=`# 《混沌の黒魔術師》 (Dark Magician of Chaos)
#
# 誘発効果:
# - CONDITIONS: このカードが召喚・特殊召喚に成功した時、自分の墓地に魔法カード1枚以上
# - ACTIVATIONS: 無し
# - RESOLUTIONS: 魔法カード1枚をサルベージ
#
# 分類されない効果:
# - 表側表示のこのカードは、フィールドから離れた場合に除外される
#
# Note:
# - レガシー版（エラッタ前）: エンドフェイズではなく、召喚・特殊召喚成功時に発動
# - 戦闘破壊時除外する効果は未実装

id: 40737112

data:
  jaName: "混沌の黒魔術師"
  type: "monster"
  frameType: "effect"
  monsterTypeList: ["effect"]
  edition: "legacy"
  attribute: "DARK"
  race: "Spellcaster"
  level: 8
  attack: 2800
  defense: 2600

effectChainableActions:
  triggers:
    - conditions:
        trigger:
          events: ["normalSummoned", "specialSummoned"]
          timing: "when"
          isMandatory: false
          selfOnly: true
        requirements:
          - step: "GRAVEYARD_HAS_SPELL"
            args: { minCount: 1 }
      resolutions:
        - step: "SALVAGE_FROM_GRAVEYARD"
          args: { filterType: "spell", count: 1 }

effectAdditionalRules:
  unclassified:
    - category: "ActionOverride"
      override: "FIELD_DEPARTURE_DESTINATION"
      args: { destination: "banished" }
`,lp=`# 《紅陽鳥》 (Crimson Sunbird)

id: 46696593

data:
  jaName: "紅陽鳥"
  type: "monster"
  frameType: "fusion"
  monsterTypeList: []
  attribute: "FIRE"
  race: "Winged Beast"
  level: 6
  attack: 2300
  defense: 1800
`,dp=`# 《アクア・ドラゴン》 (Aqua Dragon)

id: 86164529

data:
  jaName: "アクア・ドラゴン"
  type: "monster"
  frameType: "fusion"
  monsterTypeList: []
  attribute: "WATER"
  race: "Sea Serpent"
  level: 6
  attack: 2250
  defense: 1900
`,fp=`# 《金色の魔象》 (Great Mammoth of Goldfine)

id: 54622031

data:
  jaName: "金色の魔象"
  type: "monster"
  frameType: "fusion"
  monsterTypeList: []
  attribute: "DARK"
  race: "Zombie"
  level: 6
  attack: 2200
  defense: 1800
`,pp=`# 《フォーミュラ・シンクロン》 (Formula Synchron)
#
# 誘発効果:
# - CONDITIONS: このカードがシンクロ召喚に成功した時
# - ACTIVATIONS: 無し
# - RESOLUTIONS: 1枚ドローする
#
# Note: 相手ターンにシンクロ召喚できる効果は未実装

id: 50091196

data:
  jaName: "フォーミュラ・シンクロン"
  type: "monster"
  frameType: "synchro"
  monsterTypeList: ["effect", "tuner"]
  attribute: "LIGHT"
  race: "Machine"
  level: 2
  attack: 200
  defense: 1500
effectChainableActions:
  triggers:
    - conditions:
        trigger:
          events: ["synchroSummoned"]
          timing: "when"
          isMandatory: false
          selfOnly: true
      resolutions:
        - step: "DRAW"
          args: { count: 1 }
`,mp=`# 《ＴＧ ハイパー・ライブラリアン》 (T.G. Hyper Librarian)
#
# 誘発効果:
# - CONDITIONS: 他のカードがシンクロ召喚に成功した時
# - ACTIVATIONS: 無し
# - RESOLUTIONS: 1枚ドローする

id: 90953320

data:
  jaName: "ＴＧ ハイパー・ライブラリアン"
  type: "monster"
  frameType: "synchro"
  monsterTypeList: ["effect"]
  attribute: "DARK"
  race: "Spellcaster"
  level: 5
  attack: 2400
  defense: 1800
effectChainableActions:
  triggers:
    - conditions:
        trigger:
          events: ["synchroSummoned"]
          timing: "if"
          isMandatory: true
          selfOnly: false
          excludeSelf: true
      resolutions:
        - step: "DRAW"
          args: { count: 1 }
`,hp=`# 《スターダスト・チャージ・ウォリアー》 (Stardust Charge Warrior)
#
# 誘発効果:
# - CONDITIONS: このカードがシンクロ召喚に成功した時
# - ACTIVATIONS: 無し
# - RESOLUTIONS: 1枚ドローする
# TODO: 同名ターン1回制限を実装する
#
# Note: 特殊召喚された相手モンスター全てに攻撃できる効果は未実装

id: 64880894

data:
  jaName: "スターダスト・チャージ・ウォリアー"
  type: "monster"
  frameType: "synchro"
  monsterTypeList: ["effect"]
  attribute: "WIND"
  race: "Warrior"
  level: 6
  attack: 2000
  defense: 1300
effectChainableActions:
  triggers:
    - conditions:
        trigger:
          events: ["synchroSummoned"]
          timing: "when"
          isMandatory: false
          selfOnly: true
      resolutions:
        - step: "DRAW"
          args: { count: 1 }
`,_p=`# 《メタルデビル・トークン》 (Metal Fiend Token)

id: 24874631

data:
  jaName: "メタルデビル・トークン"
  type: "monster"
  frameType: "token"
  monsterTypeList: ["normal", "token"]
  attribute: "DARK"
  race: "Fiend"
  level: 1
  attack: 0
  defense: 0
`,gp=`# 《死者蘇生》 (Monster Reborn)
#
# カードの発動:
# - CONDITIONS: 墓地にモンスターが存在する
# - ACTIVATIONS: 自分の墓地のモンスター1体を対象に取る
# - RESOLUTIONS: 対象のモンスターを特殊召喚する

id: 83764719

data:
  jaName: "死者蘇生"
  type: "spell"
  frameType: "spell"
  spellType: "normal"

effectChainableActions:
  activations:
    conditions:
      requirements:
        - step: "GRAVEYARD_HAS_MONSTER"
    activations:
      - step: "SELECT_TARGETS_FROM_GRAVEYARD"
    resolutions:
      - step: "SPECIAL_SUMMON_FROM_CONTEXT"
`,Sp=`# 《強欲な壺》 (Pot of Greed)
#
# カードの発動:
# - CONDITIONS: デッキに2枚以上
# - ACTIVATIONS: 無し
# - RESOLUTIONS: 2枚ドロー

id: 55144522

data:
  jaName: "強欲な壺"
  type: "spell"
  frameType: "spell"
  spellType: "normal"

effectChainableActions:
  activations:
    conditions:
      requirements:
        - step: "CAN_DRAW"
          args: { count: 2 }
    resolutions:
      - step: "DRAW"
        args: { count: 2 }
`,vp=`# 《成金ゴブリン》 (Upstart Goblin)
#
# カードの発動:
# - CONDITIONS: デッキに1枚以上
# - ACTIVATIONS: 無し
# - RESOLUTIONS: 1枚ドロー、相手が1000LP回復

id: 70368879

data:
  jaName: "成金ゴブリン"
  type: "spell"
  frameType: "spell"
  spellType: "normal"

effectChainableActions:
  activations:
    conditions:
      requirements:
        - step: "CAN_DRAW"
          args: { count: 1 }
    resolutions:
      - step: "DRAW"
        args: { count: 1 }
      - step: "GAIN_LP"
        args: { amount: 1000, target: "opponent" }
`,Ep=`# 《天使の施し》 (Graceful Charity)
#
# カードの発動:
# - CONDITIONS: デッキに3枚以上
# - ACTIVATIONS: 無し
# - RESOLUTIONS: 3枚ドロー、手札を2枚捨てる

id: 79571449

data:
  jaName: "天使の施し"
  type: "spell"
  frameType: "spell"
  spellType: "normal"

effectChainableActions:
  activations:
    conditions:
      requirements:
        - step: "CAN_DRAW"
          args: { count: 3 }
    resolutions:
      - step: "DRAW"
        args: { count: 3 }
      - step: "THEN"
      - step: "SELECT_AND_DISCARD"
        args: { count: 2 }
`,yp=`# 《テラ・フォーミング》 (Terraforming)
#
# カードの発動:
# - CONDITIONS: デッキにフィールド魔法が1枚以上
# - ACTIVATIONS: 無し
# - RESOLUTIONS: フィールド魔法1枚をサーチ

id: 73628505

data:
  jaName: "テラ・フォーミング"
  type: "spell"
  frameType: "spell"
  spellType: "normal"

effectChainableActions:
  activations:
    conditions:
      requirements:
        - step: "DECK_HAS_CARD"
          args: { filterType: "spell", filterSpellType: "field", minCount: 1 }
    resolutions:
      - step: "SEARCH_FROM_DECK"
        args: { filterType: "spell", filterSpellType: "field", count: 1 }
`,Cp=`# 《魔法石の採掘》 (Magical Stone Excavation)
#
# カードの発動:
# - CONDITIONS: 捨てられる手札が2枚以上、墓地に魔法カードが1枚以上
# - ACTIVATIONS: 手札を2枚捨てる
# - RESOLUTIONS: 魔法カード1枚をサルベージ

id: 98494543

data:
  jaName: "魔法石の採掘"
  type: "spell"
  frameType: "spell"
  spellType: "normal"

effectChainableActions:
  activations:
    conditions:
      requirements:
        - step: "HAND_COUNT_EXCLUDING_SELF"
          args: { minCount: 2 }
        - step: "GRAVEYARD_HAS_SPELL"
          args: { minCount: 1 }
    activations:
      - step: "SELECT_AND_DISCARD"
        args: { count: 2 }
    resolutions:
      - step: "SALVAGE_FROM_GRAVEYARD"
        args: { filterType: "spell", count: 1 }
`,Ap=`# 《無の煉獄》 (Into the Void)
#
# カードの発動:
# - CONDITIONS: 手札が3枚以上、デッキに1枚以上
# - ACTIVATIONS: 無し
# - RESOLUTIONS: 1枚ドロー、エンドフェイズに手札を全て捨てる

id: 93946239

data:
  jaName: "無の煉獄"
  type: "spell"
  frameType: "spell"
  spellType: "normal"

effectChainableActions:
  activations:
    conditions:
      requirements:
        - step: "HAND_COUNT"
          args: { minCount: 3 }
        - step: "CAN_DRAW"
          args: { count: 1 }
    resolutions:
      - step: "DRAW"
        args: { count: 1 }
      - step: "DISCARD_ALL_HAND_END_PHASE"
`,Tp=`# 《命削りの宝札》 (Card of Demise)
#
# カードの発動:
# - CONDITIONS: 1ターンに1度制限
# - ACTIVATIONS: 無し
# - RESOLUTIONS: 手札が3枚になるようにドロー、エンドフェイズに手札を全て捨てる

id: 59750328

data:
  jaName: "命削りの宝札"
  type: "spell"
  frameType: "spell"
  spellType: "normal"

effectChainableActions:
  activations:
    conditions:
      requirements:
        - step: "ONCE_PER_TURN"
    resolutions:
      - step: "FILL_HANDS"
        args: { count: 3 }
      - step: "DISCARD_ALL_HAND_END_PHASE"
`,Ip=`# 《闇の量産工場》 (Dark Factory of Mass Production)
#
# カードの発動:
# - CONDITIONS: 1ターンに1度制限
# - ACTIVATIONS: 無し
# - RESOLUTIONS: 手札が3枚になるようにドロー、エンドフェイズに手札を全て捨てる

id: 90928333

data:
  jaName: "闇の量産工場"
  type: "spell"
  frameType: "spell"
  spellType: "normal"

effectChainableActions:
  activations:
    conditions:
      requirements:
        - step: "GRAVEYARD_HAS_MONSTER"
          args: { minCount: 2, frameType: "normal" }
    resolutions:
      - step: "SALVAGE_FROM_GRAVEYARD"
        args: { filterType: "monster", filterFrameType: "normal", count: 2 }
`,Op=`# 《一時休戦》 (One Day of Peace)
#
# カードの発動:
# - CONDITIONS: デッキに1枚以上
# - ACTIVATIONS: 無し
# - RESOLUTIONS: 1枚ドロー
#
# Note: 相手のドロー処理・ダメージ無効化フラグは未実装

id: 33782437

data:
  jaName: "一時休戦"
  type: "spell"
  frameType: "spell"
  spellType: "normal"

effectChainableActions:
  activations:
    conditions:
      requirements:
        - step: "CAN_DRAW"
          args: { count: 1 }
    resolutions:
      - step: "DRAW"
        args: { count: 1 }
      # TODO: ダメージ無効化フラグ設定
      # TODO: 相手のドロー処理
`,Rp=`# 《トゥーンのもくじ》 (Toon Table of Contents)
#
# カードの発動:
# - CONDITIONS: デッキに「トゥーン」カードが1枚以上
# - ACTIVATIONS: 無し
# - RESOLUTIONS: 「トゥーン」カード1枚をサーチ

id: 89997728

data:
  jaName: "トゥーンのもくじ"
  type: "spell"
  frameType: "spell"
  spellType: "normal"

effectChainableActions:
  activations:
    conditions:
      requirements:
        - step: "DECK_HAS_NAME_INCLUDES"
          args: { namePattern: "トゥーン", minCount: 1 }
    resolutions:
      - step: "SEARCH_FROM_DECK_BY_NAME"
        args: { namePattern: "トゥーン", count: 1 }
`,Np=`# 《強欲で謙虚な壺》 (Pot of Duality)
#
# カードの発動:
# - CONDITIONS: 1ターンに1度制限、デッキに3枚以上
# - ACTIVATIONS: 無し
# - RESOLUTIONS: デッキトップ3枚確認、1枚選んで手札に加える、デッキシャッフル

id: 98645731

data:
  jaName: "強欲で謙虚な壺"
  type: "spell"
  frameType: "spell"
  spellType: "normal"

effectChainableActions:
  activations:
    conditions:
      requirements:
        - step: "ONCE_PER_TURN"
        - step: "CAN_DRAW"
          args: { count: 3 }
    resolutions:
      - step: "SEARCH_FROM_DECK_TOP"
        args: { count: 3, selectCount: 1 }
      - step: "SHUFFLE_DECK"
`,Dp=`# 《打ち出の小槌》 (Magical Mallet)
#
# カードの発動:
# - CONDITIONS: 無し
# - ACTIVATIONS: 無し
# - RESOLUTIONS: 手札から任意枚数選択、デッキに戻してシャッフル、同じ枚数ドロー

id: 85852291

data:
  jaName: "打ち出の小槌"
  type: "spell"
  frameType: "spell"
  spellType: "normal"

effectChainableActions:
  activations:
    resolutions:
      - step: "SELECT_RETURN_SHUFFLE_DRAW"
        args: { min: 0 }
`,bp=`# 《黄金色の竹光》 (Golden Bamboo Sword)
#
# カードの発動:
# - CONDITIONS: 自分フィールドに「竹光」装備魔法カードが存在、デッキに2枚以上
# - ACTIVATIONS: 無し
# - RESOLUTIONS: 2枚ドロー

id: 74029853

data:
  jaName: "黄金色の竹光"
  type: "spell"
  frameType: "spell"
  spellType: "normal"

effectChainableActions:
  activations:
    conditions:
      requirements:
        - step: "CAN_DRAW"
          args: { count: 2 }
        - step: "FIELD_HAS_EQUIPPED_NAME_INCLUDES"
          args: { namePattern: "竹光" }
    resolutions:
      - step: "DRAW"
        args: { count: 2 }
`,wp=`# 《馬の骨の対価》 (White Elephant's Gift)
#
# カードの発動:
# - CONDITIONS: 条件を満たすモンスターが存在する、デッキに2枚以上
# - ACTIVATIONS: 効果モンスター以外の自分フィールドの表側表示モンスター１体を墓地へ送る
# - RESOLUTIONS: 2枚ドロー

id: 18756904

data:
  jaName: "馬の骨の対価"
  type: "spell"
  frameType: "spell"
  spellType: "normal"

effectChainableActions:
  activations:
    conditions:
      requirements:
        - step: "FIELD_HAS_NON_EFFECT_MONSTER"
        - step: "CAN_DRAW"
          args: { count: 2 }
    activations:
      - step: "RELEASE"
        args: { count: 1, excludeEffect: true }
    resolutions:
      - step: "DRAW"
        args: { count: 2 }
`,kp=`# 《デビルズ・サンクチュアリ》 (Fiend's Sanctuary)
#
# カードの発動:
# - CONDITIONS: モンスターゾーンに空きがある
# - ACTIVATIONS: なし
# - RESOLUTIONS: メタルデビル・トークン1体を特殊召喚
#
# メタルデビル・トークン:
# - id: 24874631
# - 悪魔族・闇・星１・攻／守０
#
# Note: 戦闘ダメージを相手が受ける効果。スタンバイフェイズにLPを払うかトークンを破壊する効果は未実装

id: 24874630

data:
  jaName: "デビルズ・サンクチュアリ"
  type: "spell"
  frameType: "spell"
  spellType: "normal"

effectChainableActions:
  activations:
    resolutions:
      - step: "CREATE_TOKEN_MONSTER"
        args:
          tokenCardId: 24874631
          battlePosition: "attack"
`,Lp=`# 《モンスターゲート》 (Monster Gate)
#
# カードの発動:
# - CONDITIONS: 通常召喚可能なモンスターがデッキに存在する、フィールドにモンスターが存在する
# - ACTIVATIONS: 自分フィールドのモンスター1体をリリース
# - RESOLUTIONS:
#    - 通常召喚可能なモンスターが出るまで自分のデッキの上からカードをめくる
#    - そのモンスターを特殊召喚する
#    - 残りのめくったカードは全て墓地へ送る

id: 43040603

data:
  jaName: "モンスターゲート"
  type: "spell"
  frameType: "spell"
  spellType: "normal"

effectChainableActions:
  activations:
    conditions:
      requirements:
        - step: "DECK_HAS_CARD"
          args: { filterType: "monster", minCount: 1 }
        - step: "FIELD_HAS_CARD"
          args: { filterType: "monster", minCount: 1 }
    activations:
      - step: "RELEASE"
        args: { count: 1 }
    resolutions:
      - step: "EXCAVATE_UNTIL_MONSTER"
`,xp=`# 《名推理》 (Reasoning)
#
# カードの発動:
# - CONDITIONS: 通常召喚可能なモンスターがデッキに存在する
# - ACTIVATIONS: 無し
# - RESOLUTIONS:
#    - 相手は 1~12 までの任意のレベルを宣言する（ランダム選択で代替）
#    - 通常召喚可能なモンスターが出るまで自分のデッキの上からカードをめくる
#    - そのモンスターのレベルが
#      - 宣言したレベルと異なる場合、特殊召喚する
#      - 宣言したレベルと同じ場合、墓地へ送る
#    - 残りのめくったカードは全て墓地へ送る
#
# Note: 通常レベル9以上が宣言されることはほぼないため、1~8でランダム選択している。

id: 58577036

data:
  jaName: "名推理"
  type: "spell"
  frameType: "spell"
  spellType: "normal"

effectChainableActions:
  activations:
    conditions:
      requirements:
        - step: "DECK_HAS_CARD"
          args: { filterType: "monster", minCount: 1 }
    resolutions:
      - step: "DECLARE_RANDOM_INTEGER"
        args: { minValue: 1, maxValue: 8, messageTemplate: "レベル{value}が宣言されました" }
      - step: "EXCAVATE_UNTIL_MONSTER_WITH_LEVEL_CHECK"
`,Fp=`# 《遺言状》 (Last Will)
#
# 永続効果（擬似）:
# - TRIGGER: 自分フィールドのモンスターカードが墓地へ送られた場合
# - EFFECT: デッキから攻撃力1500以下のモンスター1体を特殊召喚
#
# Note:
# 正確には通常魔法であり、発動後墓地に送られても使える「残存効果」だが、
# 「残存効果」は特殊ケースのため、代わりに「永続魔法」として実装する。
# 永続魔法でもプレイヤー体験（モンスターが墓地へ送られたら特殊召喚）は再現できる。

id: 85602018

data:
  jaName: "遺言状"
  type: "spell"
  frameType: "spell"
  spellType: "continuous"
  edition: "legacy"

effectChainableActions:
  activations:
    conditions:
      requirements: []
    activations: []

effectAdditionalRules:
  continuous:
    - category: "TriggerRule"
      conditions:
        trigger:
          events: ["monsterSentToGraveyard"]
          timing: "if"
          isMandatory: false
          excludeSelf: true
          sourceZones: ["mainMonsterZone", "spellTrapZone", "fieldZone"]
      resolutions:
        - step: "SPECIAL_SUMMON_FROM_DECK_BY_ATK"
          args: { maxAtk: 1500 }
`,$p=`# 《貪欲な壺》 (Pot of Avarice)
#
# カードの発動:
# - CONDITIONS: 墓地にモンスター5体以上
# - ACTIVATIONS: 自分の墓地のモンスター5体を対象に取る
# - RESOLUTIONS: 対象の5体をデッキに戻してシャッフル、2枚ドロー

id: 67169062

data:
  jaName: "貪欲な壺"
  type: "spell"
  frameType: "spell"
  spellType: "normal"

effectChainableActions:
  activations:
    conditions:
      requirements:
        - step: "GRAVEYARD_HAS_MONSTER"
          args: { minCount: 5 }
    activations:
      - step: "SELECT_TARGETS_FROM_GRAVEYARD"
        args: { count: 5 }
    resolutions:
      - step: "RETURN_CONTEXT_CARDS_TO_DECK_SHUFFLE"
      - step: "DRAW"
        args: { count: 2 }
`,Pp=`# 《次元融合》 (Dimension Fusion)
#
# カードの発動:
# - CONDITIONS: 自分のLPが2000以上
# - ACTIVATIONS: LP2000を支払う（コスト）
# - RESOLUTIONS: お互いの除外ゾーンのモンスターを可能な限り特殊召喚する

id: 23557835

data:
  jaName: "次元融合"
  type: "spell"
  frameType: "spell"
  spellType: "normal"

effectChainableActions:
  activations:
    conditions:
      requirements:
        - step: "LP_AT_LEAST"
          args: { amount: 2000 }
    activations:
      - step: "PAY_LP"
        args: { amount: 2000 }
    resolutions:
      - step: "SPECIAL_SUMMON_FROM_BANISHED_AS_POSSIBLE"
`,Mp=`# 《手札断殺》 (Hand Destruction)
#
# カードの発動:
# - CONDITIONS: 捨てられる手札が2枚以上、デッキに2枚以上
# - ACTIVATIONS: 無し
# - RESOLUTIONS: 手札を2枚捨てる、2枚ドロー
#
# Note: 相手の捨てる処理・ドロー処理は未実装

id: 74519184

data:
  jaName: "手札断殺"
  type: "spell"
  frameType: "spell"
  spellType: "quick-play"

effectChainableActions:
  activations:
    conditions:
      requirements:
        - step: "HAND_COUNT_EXCLUDING_SELF"
          args: { minCount: 2 }
        - step: "CAN_DRAW"
          args: { count: 2 }
    resolutions:
      - step: "SELECT_AND_DISCARD"
        args: { count: 2 }
      - step: "DRAW"
        args: { count: 2 }
`,Up=`# 《リロード》 (Reload)
#
# カードの発動:
# - CONDITIONS: 無し
# - ACTIVATIONS: 無し
# - RESOLUTIONS: 手札を全てデッキに戻してシャッフル、同じ枚数ドロー

id: 22589918

data:
  jaName: "リロード"
  type: "spell"
  frameType: "spell"
  spellType: "quick-play"

effectChainableActions:
  activations:
    resolutions:
      - step: "RETURN_ALL_HAND_SHUFFLE_DRAW"
`,Zp=`# 《トゥーン・ワールド》 (Toon World)
#
# カードの発動:
# - CONDITIONS: LP>=1000
# - ACTIVATIONS: 1000LP支払い
# - RESOLUTIONS: 無し（フィールドに残る）

id: 15259703

data:
  jaName: "トゥーン・ワールド"
  type: "spell"
  frameType: "spell"
  spellType: "continuous"

effectChainableActions:
  activations:
    conditions:
      requirements:
        - step: "LP_AT_LEAST"
          args: { amount: 1000 }
    activations:
      - step: "PAY_LP"
        args: { amount: 1000 }
`,zp=`# 《チキンレース》 (Chicken Game)
#
# 起動効果:
# - CONDITIONS: LP>1000、1ターンに1度制限
# - ACTIVATIONS: 1000LP支払い
# - RESOLUTIONS: 1枚ドロー
#
# Note: 本来は3つの選択肢から1つを選択するが、実装簡略化のためドロー効果のみ実装

id: 67616300

data:
  jaName: "チキンレース"
  type: "spell"
  frameType: "spell"
  spellType: "field"

effectChainableActions:
  ignitions:
    - conditions:
        requirements:
          - step: "ONCE_PER_TURN_EFFECT"
            args: { effectIndex: 1 }
          - step: "LP_GREATER_THAN"
            args: { amount: 1000 }
      activations:
        - step: "PAY_LP"
          args: { amount: 1000 }
      resolutions:
        - step: "DRAW"
          args: { count: 1 }
`,Vp=`# 《折れ竹光》 (Broken Bamboo Sword)
#
# カードの発動:
# - CONDITIONS: 条件を満たすモンスターが存在する
# - ACTIVATIONS: フィールド上のモンスター1体を対象に取る
# - RESOLUTIONS: 装備モンスターの攻撃力0アップ

id: 41587307

data:
  jaName: "折れ竹光"
  type: "spell"
  frameType: "spell"
  spellType: "equip"
`,Hp=`# 《ワンダー・ワンド》 (Wonder Wand)
#
# カードの発動:
# - CONDITIONS: 魔法使い族モンスターが存在する
# - ACTIVATIONS: フィールド上の魔法使い族モンスター1体を対象に取る
# - RESOLUTIONS: 装備モンスターの攻撃力500アップ（未実装）
#
# 起動効果:
# - CONDITIONS: デッキに2枚以上
# - ACTIVATIONS: 装備モンスターとこのカードを自分フィールドから墓地へ送る
# - RESOLUTIONS: 2枚ドロー

id: 67775894

data:
  jaName: "ワンダー・ワンド"
  type: "spell"
  frameType: "spell"
  spellType: "equip"

effectChainableActions:
  activations:
    conditions:
      requirements:
        - step: "FIELD_HAS_MONSTER_WITH_RACE"
          args: { race: "Spellcaster" }
    activations:
      - step: "SELECT_TARGET_FROM_FIELD_BY_RACE"
        args: { race: "Spellcaster" }
    resolutions: []

  ignitions:
    - conditions:
        requirements:
          - step: "CAN_DRAW"
            args: { count: 2 }
      activations:
        - step: "SEND_EQUIPPED_AND_SELF_TO_GRAVEYARD"
      resolutions:
        - step: "DRAW"
          args: { count: 2 }
`,qp=`# 《早すぎた埋葬》 (Premature Burial)
#
# カードの発動:
# - CONDITIONS: 墓地にモンスターが存在する、LP800以上
# - ACTIVATIONS: LP800払う、自分の墓地のモンスター1体を対象に取る
# - RESOLUTIONS: 対象のモンスターを特殊召喚し、このカードを装備する

id: 70828912

data:
  jaName: "早すぎた埋葬"
  type: "spell"
  frameType: "spell"
  spellType: "equip"

effectChainableActions:
  activations:
    conditions:
      requirements:
        - step: "GRAVEYARD_HAS_MONSTER"
        - step: "LP_AT_LEAST"
          args: { amount: 800 }
    activations:
      - step: "PAY_LP"
        args: { amount: 800 }
      - step: "SELECT_TARGETS_FROM_GRAVEYARD"
    resolutions:
      - step: "SPECIAL_SUMMON_FROM_CONTEXT"
        args: { clearContext: false }
      - step: "ESTABLISH_EQUIP"
`,Hn=new Map([[70903634,Bf],[7902349,Yf],[8124921,Kf],[44519536,Wf],[27125110,Jf],[21615956,Xf],[47643326,Qf],[33396948,ep],[70791313,np],[423585,tp],[26202165,rp],[78010363,ip],[34206604,op],[95727991,sp],[79875176,ap],[45221020,cp],[40737112,up],[46696593,lp],[86164529,dp],[54622031,fp],[50091196,pp],[90953320,mp],[64880894,hp],[24874631,_p],[83764719,gp],[55144522,Sp],[70368879,vp],[79571449,Ep],[73628505,yp],[98494543,Cp],[93946239,Ap],[59750328,Tp],[90928333,Ip],[33782437,Op],[89997728,Rp],[98645731,Np],[85852291,Dp],[74029853,bp],[18756904,wp],[24874630,kp],[43040603,Lp],[58577036,xp],[85602018,Fp],[67169062,$p],[23557835,Pp],[74519184,Mp],[22589918,Up],[15259703,Zp],[67616300,zp],[41587307,Vp],[67775894,Hp],[70828912,qp]]);class on{constructor(n){C(this,"cardId");C(this,"effectId");C(this,"effectCategory","activation");this.cardId=n,this.effectId=Rn.Id.create("activation",n)}canActivate(n,t){const r=this.subTypeConditions(n,t);if(!r.isValid)return r;const i=this.individualConditions(n,t);return i.isValid?f.Validation.success():i}createActivationSteps(n,t){return[lt(this.cardId),Ca(t),...this.subTypePreActivationSteps(n,t),...this.individualActivationSteps(n,t),...this.subTypePostActivationSteps(n,t)]}createResolutionSteps(n,t){return[...this.subTypePreResolutionSteps(n,t),...this.individualResolutionSteps(n,t),...this.subTypePostResolutionSteps(n,t)]}}class gi extends on{constructor(){super(...arguments);C(this,"spellSpeed",1)}subTypeConditions(t,r){return _.Phase.isMain(t.phase)?f.Validation.success():f.Validation.failure(f.Validation.ERROR_CODES.NOT_MAIN_PHASE)}subTypePreActivationSteps(t,r){return[]}subTypePostActivationSteps(t,r){return[]}subTypePreResolutionSteps(t,r){return[]}subTypePostResolutionSteps(t,r){return[]}static createNoOp(t){return new Gp(t)}}class Gp extends gi{constructor(n){super(n)}individualConditions(){return f.Validation.success()}individualActivationSteps(){return[]}individualResolutionSteps(){return[]}}const Si=(e,n="対象を保存")=>({id:`save-targets-${e}`,summary:n,description:"対象にとったカードをコンテキストに保存します",notificationLevel:"silent",action:(t,r)=>{if(!r||r.length===0)return f.Result.failure(t,"No targets selected to save");const i={...t,activationContexts:_.ActivationContext.setTargets(t.activationContexts,e,r)};return f.Result.success(i,`Saved ${r.length} target(s) to context`)}}),jp=e=>({id:`clear-context-${e}`,summary:"コンテキストクリア",description:"効果解決コンテキストをクリアします",notificationLevel:"silent",action:n=>{const t={...n,activationContexts:_.ActivationContext.clear(n.activationContexts,e)};return f.Result.success(t,"Context cleared")}}),Bp=(e,n)=>{const t=S.optionalString(e,"effectId"),r=t||n.effectId;if(!r)throw new Error("SAVE_TARGETS_TO_CONTEXT step requires effectId (via args or context)");const i=S.optionalString(e,"summary");return Si(r,i)},Yp=(e,n)=>{const t=S.optionalString(e,"effectId"),r=t||n.effectId;if(!r)throw new Error("CLEAR_CONTEXT step requires effectId (via args or context)");return jp(r)},Kp=(e,n,t,r="レベル{value}を宣言")=>{const i=r.replace("{value}","?");return{id:`declare-random-integer-${e}`,summary:i,description:`${n}〜${t}の値をランダムに宣言します`,notificationLevel:"dynamic",action:o=>{const s=Math.floor(Math.random()*(t-n+1))+n,a={...o,activationContexts:_.ActivationContext.setDeclaredInteger(o.activationContexts,e,s)},c=r.replace("{value}",String(s));return f.Result.success(a,c)}}},Wp=(e,n)=>{const t=S.positiveInt(e,"minValue"),r=S.positiveInt(e,"maxValue"),i=S.string(e,"messageTemplate"),o=S.optionalString(e,"effectId"),s=o||n.effectId;if(!s)throw new Error("DECLARE_RANDOM_INTEGER step requires effectId (via args or context)");return Kp(s,t,r,i)},vi=(e,n)=>({id:`establish-equip-${e}`,summary:"装備関係確立",description:"装備カードをモンスターに装備します",notificationLevel:"silent",action:t=>{const r=_.ActivationContext.getTargets(t.activationContexts,e);if(r.length===0)return f.Result.failure(t,"No equip target found in activation context");const i=r[0],o=_.Space.findCard(t.space,n);if(!o)return f.Result.failure(t,`Equip card not found: ${n}`);if(!o.stateOnField)return f.Result.failure(t,"Equip card is not on the field");const s=_.Space.findCard(t.space,i);if(!s)return f.Result.failure(t,`Equip target not found: ${i}`);const a=_.Space.updateCardStateInPlace(t.space,o,{equippedTo:i}),c={...t,space:a,activationContexts:_.ActivationContext.clear(t.activationContexts,e)};return f.Result.success(c,`Equipped to ${s.jaName??i}`)}}),Jp=e=>({id:`send-equipped-and-self-to-graveyard-${e}`,summary:"装備モンスターとこのカードを墓地へ",description:"装備モンスターとこのカードを墓地へ送ります",notificationLevel:"silent",action:n=>{const t=_.Space.findCard(n.space,e);if(!t)return f.Result.failure(n,`Equip card not found: ${e}`);if(!t.stateOnField)return f.Result.failure(n,"Equip card is not on the field");const r=t.stateOnField.equippedTo;if(!r)return f.Result.failure(n,"Equip card is not equipped to any monster");const i=_.Space.findCard(n.space,r);if(!i)return f.Result.failure(n,`Equipped monster not found: ${r}`);let o=_.Space.moveCard(n.space,i,"graveyard");o=_.Space.moveCard(o,t,"graveyard");const s={...n,space:o};return f.Result.success(s,`Sent ${i.jaName} and ${t.jaName} to graveyard`)}}),Xp=e=>({id:`unequip-${e}`,summary:"装備解除",description:"装備を解除します",notificationLevel:"silent",action:n=>{const t=_.Space.findCard(n.space,e);if(!t)return f.Result.failure(n,`Equip card not found: ${e}`);if(!t.stateOnField)return f.Result.success(n,"Equip card is not on field");const r=_.Space.updateCardStateInPlace(n.space,t,{equippedTo:void 0}),i={...n,space:r};return f.Result.success(i,`Unequipped ${t.jaName??e}`)}}),Qp=(e,n)=>{const t=S.optionalString(e,"effectId"),r=t||n.effectId,i=S.optionalString(e,"equipCardInstanceId")??n.sourceInstanceId;if(!r)throw new Error("ESTABLISH_EQUIP step requires effectId (via args or context)");if(!i)throw new Error("ESTABLISH_EQUIP step requires equipCardInstanceId (via args or context)");return vi(r,i)},em=(e,n)=>{const t=S.optionalString(e,"equipCardInstanceId")??n.sourceInstanceId;if(!t)throw new Error("SEND_EQUIPPED_AND_SELF_TO_GRAVEYARD step requires equipCardInstanceId (via args or context)");return Jp(t)},nm=(e,n)=>{const t=S.optionalString(e,"equipCardInstanceId")??n.sourceInstanceId;if(!t)throw new Error("UNEQUIP step requires equipCardInstanceId (via args or context)");return Xp(t)};class ft extends on{constructor(){super(...arguments);C(this,"spellSpeed",1)}useDefaultEquipTargetSelection(){return!0}subTypeConditions(t,r){return _.Phase.isMain(t.phase)?this.useDefaultEquipTargetSelection()&&t.space.mainMonsterZone.filter(o=>o.type==="monster"&&E.Instance.isFaceUp(o)).length===0?f.Validation.failure(f.Validation.ERROR_CODES.NO_VALID_TARGET):f.Validation.success():f.Validation.failure(f.Validation.ERROR_CODES.NOT_MAIN_PHASE)}subTypePreActivationSteps(t,r){return[]}subTypePostActivationSteps(t,r){if(!this.useDefaultEquipTargetSelection())return[];const i=this.effectId,o=s=>!(s.type!=="monster"||!E.Instance.isFaceUp(s));return[Ue({id:`${this.cardId}-select-equip-target`,sourceCardId:this.cardId,summary:"装備対象を選択",description:"装備するモンスターを1体選択してください",availableCards:null,_sourceZone:"mainMonsterZone",_filter:o,minCards:1,maxCards:1,onSelect:(s,a)=>a.length===0?f.Result.failure(s,"No target selected"):Si(i,"装備対象を保存").action(s,a)})]}subTypePreResolutionSteps(t,r){return[]}subTypePostResolutionSteps(t,r){return[vi(this.effectId,r.instanceId)]}static createNoOp(t){return new tm(t)}}class tm extends ft{constructor(n){super(n)}individualConditions(){return f.Validation.success()}individualActivationSteps(){return[]}individualResolutionSteps(){return[]}}class pt extends on{constructor(){super(...arguments);C(this,"spellSpeed",1)}subTypeConditions(t,r){return _.Phase.isMain(t.phase)?f.Validation.success():f.Validation.failure(f.Validation.ERROR_CODES.NOT_MAIN_PHASE)}subTypePreActivationSteps(t,r){return[]}subTypePostActivationSteps(t,r){return[]}subTypePreResolutionSteps(t,r){return[]}subTypePostResolutionSteps(t,r){return[]}static createNoOp(t){return new rm(t)}}class rm extends pt{constructor(n){super(n)}individualConditions(){return f.Validation.success()}individualActivationSteps(){return[]}individualResolutionSteps(){return[]}}function im(e,n){return{id:(n==null?void 0:n.id)??`queue-end-phase-effect-${e.id}`,summary:(n==null?void 0:n.summary)??"エンドフェイズ効果を登録",description:(n==null?void 0:n.description)??"エンドフェイズに処理される効果を登録します",notificationLevel:"silent",action:t=>{const r={...t,queuedEndPhaseEffectIds:[...t.queuedEndPhaseEffectIds,e.id]};return f.Result.success(r,`Added end phase effect: ${e.summary}`)}}}const Ei=(e,n)=>({id:`send-${e}-to-graveyard`,summary:"墓地へ送る",description:`《${n}》を墓地に送ります`,notificationLevel:"static",action:t=>{const r=_.Space.findCard(t.space,e),i={...t,space:_.Space.moveCard(t.space,r,"graveyard")};return f.Result.success(i,`Sent ${n} to graveyard`,ue.sentToGraveyard(r))}}),yi=(e,n)=>{let t=e.space;const r=[];for(const o of n){const s=_.Space.findCard(t,o);t=_.Space.moveCard(t,s,"graveyard"),r.push(...ue.sentToGraveyard(s))}const i={...e,space:t};return f.Result.success(i,`Sent ${n.length} card${n.length>1?"s":""} to graveyard`,r)},om=e=>{const n=[...e.space.hand];if(n.length===0)return f.Result.success(e,"No cards in hand to discard");const t=n.map(r=>r.instanceId);return yi(e,t)},sm=()=>({id:"discard-all-hand",summary:"手札を全て捨てる",description:"手札を全て捨てます",notificationLevel:"static",action:e=>om(e)}),am=()=>im(sm(),{id:"end-phase-discard-all-hand",summary:"手札を全て捨てる",description:"エンドフェイズに手札を全て捨てます"}),cm={spell:"魔法",monster:"モンスター",trap:"罠"},um=(e,n,t,r)=>{const i=t?cm[t]:"",o=t?`手札の${i}を${e}枚捨てる`:`手札を${e}枚捨てる`,s=t?`手札から${i}カードを${e}枚選んで捨てます`:`手札から${e}枚選んで捨てます`;return Ue({id:`select-and-discard-${e}-${t??"any"}-cards`,sourceCardId:r,summary:o,description:s,availableCards:null,_sourceZone:"hand",_filter:t?a=>a.type===t:void 0,minCards:e,maxCards:e,cancelable:n??!1,onSelect:(a,c)=>c.length!==e?f.Result.failure(a,`Must select exactly ${e} card${e>1?"s":""} to discard`):yi(a,c)})},lm=(e,n)=>{const t=S.positiveInt(e,"count"),r=S.optionalBoolean(e,"cancelable",!1),i=S.optionalCardType(e,"filterType");return um(t,r,i,n.cardId)},dm=()=>am();class Ci extends on{constructor(){super(...arguments);C(this,"spellSpeed",1)}subTypeConditions(t,r){return _.Phase.isMain(t.phase)?f.Validation.success():f.Validation.failure(f.Validation.ERROR_CODES.NOT_MAIN_PHASE)}subTypePreActivationSteps(t,r){return[]}subTypePostActivationSteps(t){return[]}subTypePreResolutionSteps(t,r){return[]}subTypePostResolutionSteps(t,r){return[Ei(r.instanceId,r.jaName)]}static createNoOp(t){return new fm(t)}}class fm extends Ci{constructor(n){super(n)}individualConditions(){return f.Validation.success()}individualActivationSteps(){return[]}individualResolutionSteps(){return[]}}class O{static register(n,t){if(this.steps.has(n))throw new Error(`Step "${n}" is already registered`);this.steps.set(n,t)}static build(n,t={},r){const i=this.steps.get(n);if(!i)throw new Error(`Unknown step "${n}" in card ${r.cardId}. Available steps: ${Array.from(this.steps.keys()).join(", ")}`);return i(t,r)}static isRegistered(n){return this.steps.has(n)}static getRegisteredNames(){return Array.from(this.steps.keys())}static clear(){this.steps.clear()}}C(O,"steps",new Map);const Ai=(e,n)=>({id:n.id,summary:n.summary,description:n.description,notificationLevel:"static",action:t=>{const{drawCount:r,message:i}=e(t);if(r===0)return f.Result.success(t,i);if(t.space.mainDeck.length<r)return f.Result.failure(t,`Insufficient deck: needed ${r}, but only ${t.space.mainDeck.length} remaining.`);const o={...t,space:nt(t.space,r)};return f.Result.success(o,`${i} (${r} card${r>1?"s":""})`)}}),pm=e=>Ai(()=>({drawCount:e,message:`Draw ${e} card(s)`}),{id:`draw-${e}`,summary:"カードをドロー",description:`デッキから${e}枚ドローします`}),mm=e=>Ai(n=>{const t=Math.max(0,e-n.space.hand.length);return{drawCount:t,message:t===0?`Hand already has ${e} or more cards`:`Filled hand to ${e}`}},{id:`fill-hands-${e}`,summary:`手札が${e}枚になるまでドロー`,description:`手札が${e}枚になるまでドローします`}),hm=e=>{const n=S.positiveInt(e,"count");return pm(n)},_m=e=>{const n=S.positiveInt(e,"count");return mm(n)},Ti=(e,n)=>{let t=e;const r=n.length;for(const i of n)t=_.Space.moveCard(t,i,"mainDeck");return t=_.Space.shuffleMainDeck(t),t=_.Space.drawCards(t,r),{updatedSpace:t,message:`${r}枚をデッキに戻し、シャッフルして${r}枚ドローしました`}},gm=e=>Ue({id:"select-and-return-to-deck",sourceCardId:e.sourceCardId,summary:"手札をデッキに戻す",description:`デッキに戻すカードを選択してください（${e.min}〜${e.max??100}枚）`,availableCards:null,_sourceZone:"hand",_filter:void 0,minCards:e.min,maxCards:e.max??100,cancelable:!1,onSelect:(n,t)=>{if(t.length===0)return f.Result.success(n,"No cards selected");const r=t.map(s=>_.Space.findCard(n.space,s)),{updatedSpace:i,message:o}=Ti(n.space,r);return f.Result.success({...n,space:i},o)}}),Sm=()=>({id:"return-all-hand-shuffle-draw",summary:"手札を全てデッキに戻す",description:"手札を全てデッキに戻し、シャッフルして同じ枚数ドローします",action:e=>{const n=e.space.hand;if(n.length===0)return f.Result.success(e,"手札がありません");const{updatedSpace:t,message:r}=Ti(e.space,n);return f.Result.success({...e,space:t},r)}}),vm=(e,n)=>{const t=e.min??0,r=e.max;if(typeof t!="number"||t<0)throw new Error("SELECT_RETURN_SHUFFLE_DRAW step requires a non-negative min argument");return gm({min:t,max:r,sourceCardId:n.cardId})},Em=()=>Sm(),Nn=(e,n,t)=>({id:e.id,sourceCardId:e.sourceCardId,summary:e.summary,description:e.description,notificationLevel:"interactive",cardSelectionConfig:()=>({availableCards:null,minCards:e.minCards,maxCards:e.maxCards,summary:e.summary,description:e.description,cancelable:e.cancelable??!1,_sourceZone:n,_filter:e.filter}),action:(r,i)=>{if((n==="graveyard"?r.space.graveyard.filter(e.filter):r.space.mainDeck.filter((u,l)=>e.filter(u,l))).length===0)return f.Result.failure(r,`No cards available in ${n} matching the criteria`);if(!i||i.length===0)return f.Result.failure(r,"No cards selected");let s=r.space;for(const u of i){const l=_.Space.findCard(s,u);s=_.Space.moveCard(s,l,"hand")}t&&(s=_.Space.shuffleMainDeck(s));const a={...r,space:s},c=t?" and shuffled":"";return f.Result.success(a,`Added ${i.length} card${i.length>1?"s":""} from ${n} to hand${c}`)}}),ym=(e,n,t,r)=>{const i=u=>!(u.type!==n||r&&u.spellType!==r),o=r?`${r}${n}`:n,s=E.TypeJaName(n,void 0,r,void 0),a=`${s}カード${t}枚をサーチ`,c=`デッキから${s}カード${t}枚を選択し、手札に加えます`;return Nn({id:`${e}-search-from-deck-${o}`,sourceCardId:e,summary:a,description:c,filter:i,minCards:t,maxCards:t,cancelable:!1},"mainDeck",!0)},Cm=(e,n,t)=>{const r=s=>s.jaName.includes(n),i=`「${n}」カード${t}枚をサーチ`,o=`デッキから「${n}」を含むカード${t}枚を選択し、手札に加えます`;return Nn({id:`${e}-search-by-name-${n}`,sourceCardId:e,summary:i,description:o,filter:r,minCards:t,maxCards:t,cancelable:!1},"mainDeck",!0)},Am=(e,n,t)=>{const r=`デッキトップ${n}枚から${t}枚をサーチ`,i=`デッキトップ${n}枚から${t}枚を選択し、手札に加えます`,o=(s,a)=>a!==void 0&&a<n;return{id:`${e}-search-from-deck-top-${n}`,sourceCardId:e,summary:r,description:i,notificationLevel:"interactive",cardSelectionConfig:()=>({availableCards:null,minCards:t,maxCards:t,summary:r,description:i,cancelable:!1,_sourceZone:"mainDeck",_filter:o}),action:(s,a)=>{const c=s.space.mainDeck.slice(0,n);if(c.length<n)return f.Result.failure(s,`Cannot excavate ${n} cards. Deck has only ${c.length} cards.`);if(!a||a.length===0)return f.Result.failure(s,"No cards selected");let u=s.space;for(const d of a){const p=_.Space.findCard(u,d);u=_.Space.moveCard(u,p,"hand")}const l={...s,space:u};return f.Result.success(l,`Added ${a.length} card${a.length>1?"s":""} from deck to hand`)}}},Tm=(e,n,t,r)=>{const i=n==="attack"?"攻撃力":"守備力",o=c=>{if(c.type!=="monster")return!1;const u=c[n];return u===void 0?!1:u<=t},s=`${i}${t}以下のモンスター${r}体をサーチ`,a=`デッキから${i}${t}以下のモンスター${r}体を選択し、手札に加えます`;return Nn({id:`${e}-search-monster-by-${n}-${t}`,sourceCardId:e,summary:s,description:a,filter:o,minCards:r,maxCards:r,cancelable:!1},"mainDeck",!0)},Im=(e,n,t,r,i)=>{const o=d=>!(d.type!==n||r&&d.spellType!==r||i&&d.frameType!==i),s=[];i&&s.push(i),r&&s.push(r),s.push(n);const a=s.join(""),c=E.TypeJaName(n,i,r,void 0),u=`${c}カード${t}枚をサルベージ`,l=`墓地から${c}カード${t}枚を選択し、手札に加えます`;return Nn({id:`${e}-salvage-from-graveyard-${a}`,sourceCardId:e,summary:u,description:l,filter:o,minCards:t,maxCards:t,cancelable:!1},"graveyard",!1)},Om=(e,n)=>{const t=S.nonEmptyString(e,"filterType"),r=S.optionalSpellSubType(e,"filterSpellType"),i=S.positiveInt(e,"count");return ym(n.cardId,t,i,r)},Rm=(e,n)=>{const t=S.nonEmptyString(e,"namePattern"),r=S.positiveInt(e,"count");return Cm(n.cardId,t,r)},Nm=(e,n)=>{const t=S.positiveInt(e,"count"),r=S.positiveInt(e,"selectCount");return Am(n.cardId,t,r)},Dm=(e,n)=>{const t=S.oneOf(e,"statType",["attack","defense"]),r=S.nonNegativeInt(e,"maxValue"),i=S.positiveInt(e,"count");return Tm(n.cardId,t,r,i)},bm=(e,n)=>{const t=S.nonEmptyString(e,"filterType"),r=S.optionalSpellSubType(e,"filterSpellType"),i=S.optionalString(e,"filterFrameType"),o=S.positiveInt(e,"count");return Im(n.cardId,t,o,r,i)},Ii=e=>Math.min(99999,Math.max(0,e)),mt=(e,n,t)=>{const r=t==="player",i=r?"プレイヤー":"相手",o=r?"Player":"Opponent",s=e==="gain"?1:-1,a={gain:{id:"gain-lp",action:"増加",msg:"gained"},damage:{id:"damage",action:"ダメージ",msg:"took"},payment:{id:"pay-lp",action:"支払い",msg:"paid"},loss:{id:"loss-lp",action:"喪失",msg:"lost"}}[e];return{id:`${a.id}-${t}-${n}`,summary:`${i}のLP${a.action}`,description:`${i}に${n}の${a.action}が発生します`,notificationLevel:"static",action:c=>{const u=Ii(c.lp[t]+n*s),l={...c,lp:{...c.lp,[t]:u}};return f.Result.success(l,`${o} ${a.msg} ${n} LP`)}}},wm=(e,n)=>mt("gain",e,n),km=(e,n)=>mt("damage",e,n),Lm=(e,n)=>mt("payment",e,n),xm=e=>{const n=S.positiveInt(e,"amount"),t=S.optionalPlayer(e,"target","player");return wm(n,t)},Fm=e=>{const n=S.positiveInt(e,"amount"),t=S.optionalPlayer(e,"target","player");return Lm(n,t)},$m=e=>{const n=S.positiveInt(e,"amount"),t=S.optionalPlayer(e,"target","opponent");return km(n,t)},Pm=(e,n)=>{const t=S.optionalPlayer(e,"damageTarget","opponent");if(!n.effectId)throw new Error("BURN_FROM_CONTEXT step requires effectId in context");const r=n.effectId,i=t==="player"?"プレイヤー":"相手";return{id:`${n.cardId}-burn-from-context`,summary:`${i}にダメージ`,description:`リリースしたモンスターの攻撃力に基づくダメージを${i}に与えます`,notificationLevel:"static",action:o=>{const s=_.ActivationContext.getDamage(o.activationContexts,r);if(s===void 0)return f.Result.failure(o,"No damage value in activation context");const a={...o.lp,[t]:Ii(o.lp[t]-s)},c={...o,lp:a,activationContexts:_.ActivationContext.clear(o.activationContexts,r)};return f.Result.success(c,`Dealt ${s} damage to ${t}`)}}},Mm=(e,n,t,r)=>({id:`add-counter-${n}-${t}-${e}`,summary:"カウンターを置く",description:`${n==="spell"?"魔力":n}カウンターを${t}つ置きます`,notificationLevel:"silent",action:i=>{const o=_.Space.findCard(i.space,e);if(!o||!o.stateOnField)return f.Result.success(i,"カードが見つかりません");const s=o.stateOnField.counters,a=E.Counter.get(s,n);if(r!==void 0&&a>=r)return f.Result.success(i,"カウンターは既に最大数です");const c=r!==void 0?Math.min(t,r-a):t,u=E.Counter.update(s,n,c),l={...o.stateOnField,counters:u},d=_.Space.updateCardStateInPlace(i.space,o,l);return f.Result.success({...i,space:d},`${n==="spell"?"魔力":n}カウンターを${c}つ置きました`)}}),Um=(e,n,t)=>({id:`remove-counter-${n}-${t}-${e}`,summary:"カウンターを取り除く",description:`${n==="spell"?"魔力":n}カウンターを${t}つ取り除きます`,notificationLevel:"static",action:r=>{const i=_.Space.findCard(r.space,e);if(!i||!i.stateOnField)return f.Result.failure(r,`Target card not found: ${e}`);const o=i.stateOnField.counters,s=E.Counter.get(o,n);if(s<t)return f.Result.failure(r,`Insufficient counters: needed ${t}, but only ${s} available.`);const a=E.Counter.update(o,n,-t),c={...i.stateOnField,counters:a},u=_.Space.updateCardStateInPlace(r.space,i,c);return f.Result.success({...r,space:u},`Removed ${t} ${n} counter(s) from card.`)}}),Zm=(e,n)=>{const t=S.nonEmptyString(e,"counterType"),r=S.positiveInt(e,"count"),i=S.optionalPositiveInt(e,"limit"),o=n.sourceInstanceId??`instance-${n.cardId}`;return Mm(o,t,r,i)},zm=(e,n)=>{const t=S.nonEmptyString(e,"counterType"),r=S.positiveInt(e,"count"),i=n.sourceInstanceId??`instance-${n.cardId}`;return Um(i,t,r)},Vm=(e,n)=>{const t=n==="attack"?"攻撃表示":"守備表示";return{id:`change-battle-position-${e}-${n}`,summary:`${t}にする`,description:`表示形式を${t}に変更します`,notificationLevel:"static",action:r=>{const i=_.Space.findCard(r.space,e);if(!i)return f.Result.failure(r,`Card not found: ${e}`);if(!i.stateOnField)return f.Result.failure(r,`Card is not on the field: ${e}`);if(i.stateOnField.battlePosition===n)return f.Result.success(r,`Already in ${n} position`);const o=_.Space.updateCardStateInPlace(r.space,i,{battlePosition:n,position:"faceUp"}),s={...r,space:o};return f.Result.success(s,`Changed to ${n} position`)}}},Hm=(e,n)=>{const t=e.position;if(t!=="attack"&&t!=="defense")throw new Error('CHANGE_BATTLE_POSITION step requires position to be "attack" or "defense"');const r=n.sourceInstanceId;if(!r)throw new Error("CHANGE_BATTLE_POSITION step requires sourceInstanceId in context");return Vm(r,t)},qm=e=>e==="paidCosts",Gm=e=>e==="deck_normal_monster_max_level",Oi=(e,n)=>{switch(e){case"paidCosts":return n==null?void 0:n.paidCosts;default:return}},jm=(e,n,t)=>{if(!t)return;const r=n.activationContexts[t];return Oi(e,r)},ht=(e,n,t,r)=>({id:e.id,sourceCardId:e.sourceCardId,summary:e.summary,description:e.description,notificationLevel:"interactive",cardSelectionConfig:()=>({availableCards:null,minCards:1,maxCards:1,summary:e.summary,description:e.description,cancelable:!1,_sourceZone:n,_effectId:e.effectId,_filter:e.dynamicFilter??e.filter}),action:(i,o)=>{var v;const s=((v=e.createFilter)==null?void 0:v.call(e,i))??e.filter;if(i.space[n].filter(s).length===0)return f.Result.failure(i,`No cards available in ${n} matching the criteria`);const u=rn(i);if(!u.isValid)return f.Result.failure(i,f.Validation.errorMessage(u));if(!o||o.length===0)return f.Result.failure(i,"No cards selected");const l=o[0],d=_.Space.findCard(i.space,l),{state:p,event:m}=Ze(i,l,t),g=r?{...p,space:_.Space.shuffleMainDeck(p.space)}:p;return f.Result.success(g,`Special summoned ${d.jaName} in ${t} position`,[m])}}),Bm=(e,n="monster",t,r="attack",i)=>{const o=t!==void 0&&qm(t),s=n==="normal_monster"?"通常":"",a=t===void 0?"":o?"（動的レベル）":`レベル${t}`,c=`${a}${s}モンスターを特殊召喚`,u=`デッキから${a}の${s}モンスター1体を特殊召喚します`,l=(p,m,g)=>{if(p.type!=="monster"||n==="normal_monster"&&p.frameType!=="normal")return!1;if(t!==void 0){const v=o?Oi(t,g):t;if(v!==void 0&&p.level!==v)return!1}return!0},d=p=>m=>{if(m.type!=="monster"||n==="normal_monster"&&m.frameType!=="normal")return!1;if(t!==void 0){const g=o?jm(t,p,i):t;if(g!==void 0&&m.level!==g)return!1}return!0};return ht({id:`${e}-special-summon-from-deck-level${t??"any"}`,sourceCardId:e,summary:c,description:u,dynamicFilter:l,createFilter:d,effectId:i},"mainDeck",r,!0)},Ym=(e,n,t,r="attack")=>{const i=n!==void 0?`レベル${n}以下の`:"",o=t==="fusion"?"融合":"",s=`${i}${o}モンスターを特殊召喚`,a=`EXデッキから${i}${o}モンスター1体を特殊召喚します`,c=u=>!(u.type!=="monster"||n!==void 0&&(u.level??0)>n||t!==void 0&&u.frameType!==t);return ht({id:`${e}-special-summon-from-extra-deck-level${n??"any"}-${t??"any"}`,sourceCardId:e,summary:s,description:a,filter:c},"extraDeck",r,!1)},Km=(e,n,t="attack",r=!0)=>({id:`${e}-special-summon-from-context`,summary:"モンスターを特殊召喚",description:"対象のモンスターを特殊召喚します",notificationLevel:"silent",action:i=>{const o=_.ActivationContext.getTargets(i.activationContexts,n);if(o.length===0)return f.Result.failure(i,"No target found in context");const s=o[0],a=i.space.graveyard.find(p=>p.instanceId===s);if(!a){const p={...i,activationContexts:_.ActivationContext.clear(i.activationContexts,n)};return f.Result.success(p,"Target no longer in graveyard - effect fizzles")}const c=rn(i);if(!c.isValid)return f.Result.failure(i,f.Validation.errorMessage(c));const{state:u,event:l}=Ze(i,s,t),d=r?{...u,activationContexts:_.ActivationContext.clear(u.activationContexts,n)}:u;return f.Result.success(d,`Special summoned ${a.jaName} from graveyard`,[l])}}),Wm=(e,n)=>{const t=S.oneOf(e,"filterType",["monster","normal_monster"]),r=e.filterLevel,i=S.optionalOneOf(e,"battlePosition",["attack","defense"],"attack");return Bm(n.cardId,t,r,i,n.effectId)},Jm=(e,n)=>{const t=S.optionalPositiveInt(e,"filterMaxLevel"),r=S.optionalString(e,"filterFrameType"),i=S.optionalOneOf(e,"battlePosition",["attack","defense"],"attack");return Ym(n.cardId,t,r,i)},Xm=(e,n)=>{const t=S.positiveInt(e,"maxAtk"),r=S.optionalOneOf(e,"battlePosition",["attack","defense"],"attack"),i=`攻撃力${t}以下のモンスターを特殊召喚`,o=`デッキから攻撃力${t}以下のモンスター1体を特殊召喚します`,s=a=>a.type!=="monster"||a.attack===void 0||a.attack===null?!1:a.attack<=t;return ht({id:`${n.cardId}-special-summon-from-deck-by-atk${t}`,sourceCardId:n.cardId,summary:i,description:o,filter:s},"mainDeck",r,!0)},Qm=(e,n)=>{if(!n.effectId)throw new Error("SPECIAL_SUMMON_FROM_CONTEXT step requires effectId in context");const t=S.optionalOneOf(e,"battlePosition",["attack","defense"],"attack"),r=S.optionalBoolean(e,"clearContext",!0);return Km(n.cardId,n.effectId,t,r)},eh=e=>({id:`${e}-special-summon-from-banished-as-possible`,sourceCardId:e,summary:"除外モンスターを特殊召喚",description:"除外ゾーンのモンスターを可能な限り特殊召喚します",notificationLevel:"interactive",cardSelectionConfig:t=>{const r=t.space.banished.filter(s=>s.type==="monster"),i=5-t.space.mainMonsterZone.length,o=Math.min(i,r.length);return r.length<=i?null:{availableCards:null,_sourceZone:"banished",_filter:s=>s.type==="monster",minCards:o,maxCards:o,summary:"除外モンスターを選択",description:`除外ゾーンのモンスターから${o}体を選んで特殊召喚します`,cancelable:!1}},action:(t,r)=>{const o=t.space.banished.filter(d=>d.type==="monster"),s=5-t.space.mainMonsterZone.length,a=Math.min(s,o.length);if(a===0)return f.Result.success(t,"No banished monsters to summon (zone full or none available)");const c=r&&r.length>0?r:o.slice(0,a).map(d=>d.instanceId);let u=t;const l=[];for(const d of c){const{state:p,event:m}=Ze(u,d,"attack");u=p,l.push(m)}return f.Result.success(u,`Special summoned ${c.length} banished monster(s) simultaneously`,l)}}),nh=(e,n)=>eh(n.cardId),Ri=e=>e.findIndex(n=>n.type==="monster"),qn=(e,n)=>{let t=e;const r=[];for(const i of n)t=_.Space.moveCard(t,i,"graveyard"),r.push(...ue.sentToGraveyard(i));return{space:t,events:r}},th=(e,n="attack")=>({id:`${e}-excavate-until-monster`,sourceCardId:e,summary:"めくったカードを確認",description:"モンスターが出るまでデッキをめくり、そのモンスターを特殊召喚します。残りは墓地へ送ります。",notificationLevel:"interactive",cardSelectionConfig:()=>({availableCards:null,minCards:1,maxCards:1,summary:"めくったカードを確認",description:"特殊召喚するモンスターを選択してください。残りのカードは墓地へ送られます。",cancelable:!1,_sourceZone:"mainDeck",_filter:(r,i,o,s)=>{if(i===void 0||!s)return!1;const a=s.findIndex(c=>c.type==="monster");return a===-1?!1:i<=a},canConfirm:r=>r.length!==1?!1:r[0].type==="monster"}),action:(r,i)=>{const o=r.space.mainDeck,s=Ri(o);if(s===-1)return f.Result.failure(r,"デッキにモンスターが存在しません");const a=o.slice(0,s+1),c=a[a.length-1],u=a.slice(0,-1);if(!i||i.length===0)return f.Result.failure(r,"No cards selected");const l=i[0];if(l!==c.instanceId)return f.Result.failure(r,"Invalid selection");const d=rn(r);if(!d.isValid)return f.Result.failure(r,f.Validation.errorMessage(d));const{space:p,events:m}=qn(r.space,u),g={...r,space:p},{state:v,event:y}=Ze(g,l,n),N=u.map(le=>le.jaName).join("、"),A=u.length>0?`${N}を墓地へ送り、${c.jaName}を特殊召喚しました`:`${c.jaName}を特殊召喚しました`;return f.Result.success(v,A,[...m,y])}}),rh=(e,n)=>{const t=S.optionalOneOf(e,"battlePosition",["attack","defense"],"attack");return th(n.cardId,t)},ih=(e,n,t="attack")=>({id:`${e}-excavate-until-monster-level-check`,sourceCardId:e,summary:"めくったカードを確認",description:"モンスターが出るまでデッキをめくります。宣言と異なるレベルなら特殊召喚、同じなら墓地へ送ります。",notificationLevel:"interactive",cardSelectionConfig:()=>({availableCards:null,minCards:1,maxCards:1,summary:"めくったカードを確認",description:"モンスターを選択してください。残りのカードは墓地へ送られます。",cancelable:!1,_sourceZone:"mainDeck",_filter:(i,o,s,a)=>{if(o===void 0||!a)return!1;const c=a.findIndex(u=>u.type==="monster");return c===-1?!1:o<=c},canConfirm:i=>i.length!==1?!1:i[0].type==="monster"}),action:(i,o)=>{const s=i.space.mainDeck,a=Ri(s);if(a===-1)return f.Result.failure(i,"デッキにモンスターが存在しません");const c=s.slice(0,a+1),u=c[c.length-1],l=c.slice(0,-1);if(!o||o.length===0)return f.Result.failure(i,"No cards selected");const d=o[0];if(d!==u.instanceId)return f.Result.failure(i,"Invalid selection");const p=_.ActivationContext.getDeclaredInteger(i.activationContexts,n);if(p===void 0)return f.Result.failure(i,"宣言レベルが設定されていません");const m=u.level??0,g=m===p,{space:v,events:y}=qn(i.space,l);let N={...i,space:v},A;const le=l.map(F=>F.jaName).join("、"),ee=le?`${le}を墓地へ送り、`:"";if(g){const{space:F,events:G}=qn(N.space,[u]);N={...N,space:F},y.push(...G),A=`${ee}${u.jaName}（レベル${m}）は宣言と同じため墓地へ送りました`}else{const F=rn(N);if(!F.isValid)return f.Result.failure(N,f.Validation.errorMessage(F));const{state:G,event:He}=Ze(N,d,t);N=G,y.push(He),A=`${ee}${u.jaName}（レベル${m}）を特殊召喚しました`}return f.Result.success(N,A,y)}}),oh=(e,n)=>{const t=S.optionalOneOf(e,"battlePosition",["attack","defense"],"attack"),r=S.optionalString(e,"effectId"),i=r||n.effectId;if(!i)throw new Error("EXCAVATE_UNTIL_MONSTER_WITH_LEVEL_CHECK step requires effectId (via args or context)");return ih(n.cardId,i,t)},sh=(e,n,t="attack")=>{const r=H.getOrUndefined(n),i=(r==null?void 0:r.jaName)??`トークン(${n})`,o=`${i}を特殊召喚`;return{id:`${e}-create-token-${n}`,summary:o,description:`${i}を特殊召喚します`,notificationLevel:"silent",action:s=>{const a=rn(s);if(!a.isValid)return f.Result.failure(s,f.Validation.errorMessage(a));const c=H.get(n),u=Date.now(),l=Math.random().toString(36).substring(2,8),d=`token-${n}-${u}-${l}`,p=Nr(s.space,"mainMonsterZone"),m={...c,instanceId:d,location:"mainMonsterZone",stateOnField:Rr({slotIndex:p,position:"faceUp",battlePosition:t,placedThisTurn:!0})},g={...s.space,mainMonsterZone:[...s.space.mainMonsterZone,m]};return f.Result.success({...s,space:g},`${i}を${t==="attack"?"攻撃":"守備"}表示で特殊召喚しました`)}}},ah=(e,n)=>{const t=S.positiveInt(e,"tokenCardId"),r=S.optionalOneOf(e,"battlePosition",["attack","defense"],"attack");return sh(n.cardId,t,r)},We=e=>n=>n.type===e,ch=e=>n=>n.spellType===e,_t=e=>n=>n.frameType===e,Ni=e=>n=>n.jaName.includes(e),gt=e=>n=>n.level===e,uh=e=>n=>n.race===e,lh=e=>n=>n.instanceId!==e,se=(...e)=>n=>e.every(t=>t(n)),dh=(...e)=>n=>e.some(t=>t(n)),St=(e,n)=>e.filter(n).length,te=(e,n,t)=>St(e,n)>=t,_n=E.isMonster,fh=e=>E.isNonEffectMonster(e),vt=E.isSpell,ph=e=>E.isEquipSpell(e),mh=E.isTrap,Et=dh(vt,mh),yt=e=>E.Instance.isFaceUp(e),hh=(e,n,t,r)=>{let i=e.space;const o=[];for(const u of n){const l=_.Space.findCard(i,u);i=_.Space.moveCard(i,l,"banished"),o.push(l)}const s=r?_.ActivationContext.setPaidCosts(e.activationContexts,r,n.length):e.activationContexts,a={...e,space:i,activationContexts:s},c=o.map(u=>u.jaName).join("、");return f.Result.success(a,`Banished ${n.length} card(s) from graveyard: ${c}`)},Di=se(We("monster"),_t("normal")),_h=(e,n)=>{const t=St(e.space.graveyard,Et),r=Math.min(n,t);for(let i=r;i>=1;i--)if(te(e.space.mainDeck,se(Di,gt(i)),1))return i;return 1},gh=(e,n)=>te(e.space.mainDeck,se(Di,gt(n)),1),Sh={spell:"魔法",trap:"罠",spell_or_trap:"魔法・罠",monster:"モンスター"},vh=e=>{if(e)switch(e){case"spell":return n=>n.type==="spell";case"trap":return n=>n.type==="trap";case"spell_or_trap":return n=>n.type==="spell"||n.type==="trap";case"monster":return n=>n.type==="monster";default:return}},Eh=(e,n,t,r=!1,i,o,s)=>{const a=t?Sh[t]:"",c=e===n?`${e}枚`:`${e}〜${n}枚`,u=r?"裏側":"",l=`墓地の${a}を${u}除外`,d=`墓地から${a}カードを${c}選んで${u}除外します`;return Ue({id:`select-and-banish-from-graveyard-${e}-${n}-${t??"any"}`,sourceCardId:o,summary:l,description:d,availableCards:null,_sourceZone:"graveyard",_filter:vh(t),minCards:e,maxCards:n,dynamicMaxCards:s==="deck_normal_monster_max_level"?p=>_h(p,n):void 0,cancelable:!1,dynamicCanConfirm:s==="deck_normal_monster_max_level"?(p,m)=>gh(p,m.length):void 0,onSelect:(p,m)=>m.length<e?f.Result.failure(p,`Must select at least ${e} card(s) to banish`):hh(p,m,r,i)})},yh=(e,n)=>{const t=S.positiveInt(e,"minCount"),r=S.positiveInt(e,"maxCount"),i=S.optionalString(e,"filterType"),o=S.optionalBoolean(e,"faceDown",!1),s=S.optionalString(e,"dynamicMaxCount"),a=Gm(s)?s:void 0;if(r<t)throw new Error("SELECT_AND_BANISH_FROM_GRAVEYARD step requires maxCount >= minCount");return Eh(t,r,i,o,n.effectId,n.cardId,a)},Ch=()=>({id:"shuffle-deck",summary:"デッキシャッフル",description:"デッキをシャッフルします",notificationLevel:"static",action:e=>{const n={...e,space:_.Space.shuffleMainDeck(e.space)};return f.Result.success(n,"Deck shuffled")}}),Ah=e=>({id:"return-context-cards-to-deck-shuffle",summary:"対象カードをデッキに戻してシャッフル",description:"対象のカードをデッキに戻し、シャッフルします",notificationLevel:"silent",action:n=>{const t=_.ActivationContext.getTargets(n.activationContexts,e);if(t.length===0)return f.Result.failure(n,"No targets found in context");let r=n.space,i=0;for(const s of t){const a=n.space.graveyard.find(c=>c.instanceId===s);a&&(r=_.Space.moveCard(r,a,"mainDeck"),i++)}r=_.Space.shuffleMainDeck(r);const o={...n,space:r,activationContexts:_.ActivationContext.clear(n.activationContexts,e)};return f.Result.success(o,`${i}枚のカードをデッキに戻し、シャッフルしました`)}}),Th=()=>Ch(),Ih=(e,n)=>{if(!n.effectId)throw new Error("RETURN_CONTEXT_CARDS_TO_DECK_SHUFFLE step requires effectId in context");return Ah(n.effectId)},Oh=(e,n,t)=>{const r="装備対象を選択",i=`フィールドの${t}モンスター1体を対象に取ります`,o=s=>!(s.type!=="monster"||s.race!==t||!s.stateOnField||s.stateOnField.position!=="faceUp");return{id:`${e}-select-target-from-field-by-race-${t}`,sourceCardId:e,summary:r,description:i,notificationLevel:"interactive",cardSelectionConfig:()=>({availableCards:null,minCards:1,maxCards:1,summary:r,description:i,cancelable:!1,_sourceZone:"mainMonsterZone",_filter:o}),action:(s,a)=>{if(!a||a.length===0)return f.Result.failure(s,"No target selected");const c={...s,activationContexts:_.ActivationContext.setTargets(s.activationContexts,n,a)},u=_.Space.findCard(s.space,a[0]);return f.Result.success(c,`Selected ${(u==null?void 0:u.jaName)??a[0]} as equip target`)}}},Rh=(e,n,t=1)=>{const r=t===1?"墓地のモンスター1体を対象に取る":`墓地のモンスター${t}体を対象に取る`,i=t===1?"墓地からモンスター1体を対象に取ります":`墓地からモンスター${t}体を選択し、対象に取ります`,o=s=>s.type==="monster";return{id:`${e}-select-targets-from-graveyard-${t}`,sourceCardId:e,summary:r,description:i,notificationLevel:"interactive",cardSelectionConfig:()=>({availableCards:null,minCards:t,maxCards:t,summary:r,description:i,cancelable:!1,_sourceZone:"graveyard",_filter:o}),action:(s,a)=>{if(!a||a.length===0)return f.Result.failure(s,"No targets selected");const c={...s,activationContexts:_.ActivationContext.setTargets(s.activationContexts,n,a)};return f.Result.success(c,`Selected ${a.length} monsters as targets`)}}},Nh=(e,n)=>{if(!n.effectId)throw new Error("SELECT_TARGET_FROM_FIELD_BY_RACE step requires effectId in context");const t=S.nonEmptyString(e,"race");return Oh(n.cardId,n.effectId,t)},Dh=(e,n)=>{if(!n.effectId)throw new Error("SELECT_TARGETS_FROM_GRAVEYARD step requires effectId in context");const t=S.optionalPositiveInt(e,"count")??1;return Rh(n.cardId,n.effectId,t)},bi="then-marker";function bh(){return{id:bi,summary:"タイミング進行",description:"「その後」処理によりタイミングが進む",notificationLevel:"silent",action:e=>f.Result.success(e)}}function wh(e){return e.id===bi}const kh=()=>bh(),Ae=O.build.bind(O),R=di;O.register(R.DRAW,hm);O.register(R.FILL_HANDS,_m);O.register(R.SELECT_AND_DISCARD,lm);O.register(R.SELECT_RETURN_SHUFFLE_DRAW,vm);O.register(R.RETURN_ALL_HAND_SHUFFLE_DRAW,Em);O.register(R.DISCARD_ALL_HAND_END_PHASE,dm);O.register(R.SEARCH_FROM_DECK,Om);O.register(R.SEARCH_FROM_DECK_BY_NAME,Rm);O.register(R.SEARCH_FROM_DECK_TOP,Nm);O.register(R.SEARCH_MONSTER_BY_STAT,Dm);O.register(R.SALVAGE_FROM_GRAVEYARD,bm);O.register(R.GAIN_LP,xm);O.register(R.PAY_LP,Fm);O.register(R.BURN_DAMAGE,$m);O.register(R.BURN_FROM_CONTEXT,Pm);O.register(R.PLACE_COUNTER,Zm);O.register(R.REMOVE_COUNTER,zm);O.register(R.CHANGE_BATTLE_POSITION,Hm);O.register(R.SPECIAL_SUMMON_FROM_DECK,Wm);O.register(R.SPECIAL_SUMMON_FROM_DECK_BY_ATK,Xm);O.register(R.SPECIAL_SUMMON_FROM_EXTRA_DECK,Jm);O.register(R.SPECIAL_SUMMON_FROM_CONTEXT,Qm);O.register(R.CREATE_TOKEN_MONSTER,ah);O.register(R.EXCAVATE_UNTIL_MONSTER,rh);O.register(R.EXCAVATE_UNTIL_MONSTER_WITH_LEVEL_CHECK,oh);O.register(R.ESTABLISH_EQUIP,Qp);O.register(R.SEND_EQUIPPED_AND_SELF_TO_GRAVEYARD,em);O.register(R.UNEQUIP,nm);O.register(R.RELEASE,kf);O.register(R.RELEASE_FOR_BURN,Lf);O.register(R.SELECT_AND_BANISH_FROM_GRAVEYARD,yh);O.register(R.SPECIAL_SUMMON_FROM_BANISHED_AS_POSSIBLE,nh);O.register(R.SHUFFLE_DECK,Th);O.register(R.RETURN_CONTEXT_CARDS_TO_DECK_SHUFFLE,Ih);O.register(R.SELECT_TARGET_FROM_FIELD_BY_RACE,Nh);O.register(R.SELECT_TARGETS_FROM_GRAVEYARD,Dh);O.register(R.SAVE_TARGETS_TO_CONTEXT,Bp);O.register(R.CLEAR_CONTEXT,Yp);O.register(R.DECLARE_RANDOM_INTEGER,Wp);O.register(R.THEN,kh);class x{static register(n,t){if(this.conditions.has(n))throw new Error(`Condition "${n}" is already registered`);this.conditions.set(n,t)}static check(n,t,r,i={}){const o=this.conditions.get(n);if(!o)throw new Error(`Unknown condition "${n}" for card ${r.id}. Available conditions: ${Array.from(this.conditions.keys()).join(", ")}`);return o(t,r,i)}static isRegistered(n){return this.conditions.has(n)}static getRegisteredNames(){return Array.from(this.conditions.keys())}static clear(){this.conditions.clear()}}C(x,"conditions",new Map);const{success:Lh,failure:Fn,ERROR_CODES:xh}=f.Validation;function ze(e,n,t=xh.ACTIVATION_CONDITIONS_NOT_MET){return(r,i,o)=>{try{const s=e(o);return s===null?Fn(t):n(r,i,s)?Lh():Fn(t)}catch(s){if(s instanceof Z)return Fn(t);throw s}}}function Q(e,n,t){return ze(e,(r,i,o)=>n(r,o),t)}const Fh=Q(e=>({count:S.positiveInt(e,"count")}),(e,{count:n})=>e.space.mainDeck.length>=n),$h=Q(e=>({filterType:S.nonEmptyString(e,"filterType"),filterSpellType:S.optionalString(e,"filterSpellType"),minCount:S.optionalPositiveInt(e,"minCount")??1}),(e,{filterType:n,filterSpellType:t,minCount:r})=>{const i=t?se(We(n),ch(t)):We(n);return te(e.space.mainDeck,i,r)}),Ph=Q(e=>({maxCount:S.positiveInt(e,"maxCount")}),(e,{maxCount:n})=>{const t=St(e.space.graveyard,Et),r=Math.min(n,t),i=se(We("monster"),_t("normal"));for(let o=1;o<=r;o++)if(te(e.space.mainDeck,se(i,gt(o)),1))return!0;return!1}),Mh=Q(e=>({namePattern:S.nonEmptyString(e,"namePattern"),minCount:S.optionalPositiveInt(e,"minCount")??1}),(e,{namePattern:n,minCount:t})=>te(e.space.mainDeck,Ni(n),t)),Uh=Q(e=>({minCount:S.positiveInt(e,"minCount")}),(e,{minCount:n})=>e.space.hand.length>=n),Zh=ze(e=>({minCount:S.positiveInt(e,"minCount")}),(e,n,{minCount:t})=>_.Space.countHandExcludingSelf(e.space,n)>=t),zh=ze(e=>({minCount:S.optionalPositiveInt(e,"minCount")??1}),(e,n,{minCount:t})=>te(e.space.hand,se(vt,lh(n.instanceId)),t)),Vh=Q(e=>({minCount:S.optionalPositiveInt(e,"minCount")??1}),(e,{minCount:n})=>te(e.space.graveyard,vt,n)),Hh=Q(e=>({minCount:S.optionalPositiveInt(e,"minCount")??1,frameType:S.optionalString(e,"frameType")}),(e,{minCount:n,frameType:t})=>{const r=t?se(_n,_t(t)):_n;return te(e.space.graveyard,r,n)}),qh=Q(e=>({minCount:S.optionalPositiveInt(e,"minCount")??1}),(e,{minCount:n})=>te(e.space.graveyard,Et,n)),Gh=Q(e=>({filterType:S.nonEmptyString(e,"filterType"),minCount:S.optionalPositiveInt(e,"minCount")??1}),(e,{filterType:n,minCount:t})=>{const r=n==="monster"?e.space.mainMonsterZone:e.space.spellTrapZone;return te(r,We(n),t)}),jh=Q(e=>({namePattern:S.nonEmptyString(e,"namePattern")}),(e,{namePattern:n})=>te(e.space.spellTrapZone,se(ph,yt,Ni(n)),1)),Bh=Q(e=>({race:S.nonEmptyString(e,"race")}),(e,{race:n})=>te(e.space.mainMonsterZone,se(_n,yt,uh(n)),1)),Yh=Q(e=>({minCount:S.optionalPositiveInt(e,"minCount")??1}),(e,{minCount:n})=>te(e.space.mainMonsterZone,se(_n,yt,fh),n)),{ERROR_CODES:Kh}=f.Validation,Wh=(e,n,t)=>E.Counter.get(e,n)>=t,Jh=ze(e=>({counterType:S.nonEmptyString(e,"counterType"),minCount:S.positiveInt(e,"minCount")}),(e,n,{counterType:t,minCount:r})=>{var o;const i=((o=n.stateOnField)==null?void 0:o.counters)??[];return Wh(i,t,r)},Kh.INSUFFICIENT_COUNTERS),Xh=(e,n)=>!e.includes(n),Qh=(e,n)=>{var r,i;const t=Rn.Id.create("ignition",e.id,n);return!((i=(r=e.stateOnField)==null?void 0:r.activatedEffects)!=null&&i.includes(t))},e_=ze(e=>({cardId:S.optionalPositiveInt(e,"cardId")}),(e,n,{cardId:t})=>{const r=t??n.id;return Xh(e.activatedCardIds,r)}),n_=ze(e=>({effectIndex:S.positiveInt(e,"effectIndex")}),(e,n,{effectIndex:t})=>Qh(n,t)),t_=(e,n,t)=>e[n]>=t,r_=(e,n,t)=>e[n]>t,i_=Q(e=>({amount:S.nonNegativeInt(e,"amount"),target:S.optionalPlayer(e,"target","player")}),(e,{amount:n,target:t})=>t_(e.lp,t,n)),o_=Q(e=>({amount:S.nonNegativeInt(e,"amount"),target:S.optionalPlayer(e,"target","player")}),(e,{amount:n,target:t})=>r_(e.lp,t,n)),Ve=x.check.bind(x),U=li;x.register(U.CAN_DRAW,Fh);x.register(U.DECK_HAS_CARD,$h);x.register(U.DECK_HAS_NAME_INCLUDES,Mh);x.register(U.DECK_HAS_NORMAL_MONSTER_FOR_GRAVEYARD_BANISH,Ph);x.register(U.HAND_COUNT,Uh);x.register(U.HAND_COUNT_EXCLUDING_SELF,Zh);x.register(U.HAND_HAS_SPELL,zh);x.register(U.GRAVEYARD_HAS_SPELL,Vh);x.register(U.GRAVEYARD_HAS_MONSTER,Hh);x.register(U.GRAVEYARD_HAS_SPELL_OR_TRAP,qh);x.register(U.FIELD_HAS_CARD,Gh);x.register(U.FIELD_HAS_EQUIPPED_NAME_INCLUDES,jh);x.register(U.FIELD_HAS_MONSTER_WITH_RACE,Bh);x.register(U.FIELD_HAS_NON_EFFECT_MONSTER,Yh);x.register(U.HAS_COUNTER,Jh);x.register(U.ONCE_PER_TURN,e_);x.register(U.ONCE_PER_TURN_EFFECT,n_);x.register(U.LP_AT_LEAST,i_);x.register(U.LP_GREATER_THAN,o_);class s_ extends Ci{constructor(t,r){super(t);C(this,"dslDefinition");this.dslDefinition=r}buildSteps(t,r){if(!t||t.length===0)return[];const i={cardId:this.cardId,sourceInstanceId:r.instanceId,effectId:this.effectId};return t.map(o=>Ae(o.step,o.args??{},i))}individualConditions(t,r){const i=this.dslDefinition.conditions;if(!i||!i.requirements||i.requirements.length===0)return f.Validation.success();for(const o of i.requirements){const s=Ve(o.step,t,r,o.args??{});if(!s.isValid)return s}return f.Validation.success()}individualActivationSteps(t,r){return this.buildSteps(this.dslDefinition.activations,r)}individualResolutionSteps(t,r){return this.buildSteps(this.dslDefinition.resolutions,r)}}function a_(e,n){return new s_(e,n)}class wi extends on{constructor(){super(...arguments);C(this,"spellSpeed",2)}subTypeConditions(t,r){var i;return E.Instance.isFaceDown(r)&&((i=r.stateOnField)!=null&&i.placedThisTurn)?f.Validation.failure(f.Validation.ERROR_CODES.QUICK_PLAY_RESTRICTION):f.Validation.success()}subTypePreActivationSteps(t,r){return[]}subTypePostActivationSteps(t,r){return[]}subTypePreResolutionSteps(t,r){return[]}subTypePostResolutionSteps(t,r){return[Ei(r.instanceId,r.jaName)]}static createNoOp(t){return new c_(t)}}class c_ extends wi{constructor(n){super(n)}individualConditions(){return f.Validation.success()}individualActivationSteps(){return[]}individualResolutionSteps(){return[]}}class u_ extends wi{constructor(t,r){super(t);C(this,"dslDefinition");this.dslDefinition=r}buildSteps(t,r){if(!t||t.length===0)return[];const i={cardId:this.cardId,sourceInstanceId:r.instanceId};return t.map(o=>Ae(o.step,o.args??{},i))}individualConditions(t,r){const i=this.dslDefinition.conditions;if(!i||!i.requirements||i.requirements.length===0)return f.Validation.success();for(const o of i.requirements){const s=Ve(o.step,t,r,o.args??{});if(!s.isValid)return s}return f.Validation.success()}individualActivationSteps(t,r){return this.buildSteps(this.dslDefinition.activations,r)}individualResolutionSteps(t,r){return this.buildSteps(this.dslDefinition.resolutions,r)}}function l_(e,n){return new u_(e,n)}class d_ extends pt{constructor(t,r){super(t);C(this,"dslDefinition");this.dslDefinition=r}buildSteps(t,r){if(!t||t.length===0)return[];const i={cardId:this.cardId,sourceInstanceId:r.instanceId};return t.map(o=>Ae(o.step,o.args??{},i))}individualConditions(t,r){const i=this.dslDefinition.conditions;if(!i||!i.requirements||i.requirements.length===0)return f.Validation.success();for(const o of i.requirements){const s=Ve(o.step,t,r,o.args??{});if(!s.isValid)return s}return f.Validation.success()}individualActivationSteps(t,r){return this.buildSteps(this.dslDefinition.activations,r)}individualResolutionSteps(t,r){return this.buildSteps(this.dslDefinition.resolutions,r)}}function f_(e,n){return new d_(e,n)}class p_{constructor(n,t){C(this,"cardId");C(this,"effectId");C(this,"effectCategory","ignition");C(this,"spellSpeed",1);this.cardId=n,this.effectId=Rn.Id.create("ignition",n,t)}canActivate(n,t){if(!_.Phase.isMain(n.phase))return f.Validation.failure(f.Validation.ERROR_CODES.NOT_MAIN_PHASE);const r=this.individualConditions(n,t);return r.isValid?f.Validation.success():r}createActivationSteps(n,t){return[lt(t.id),...this.individualActivationSteps(n,t)]}createResolutionSteps(n,t){return[...this.individualResolutionSteps(n,t)]}}class m_ extends p_{constructor(t,r,i){super(t,r);C(this,"dslDefinition");this.dslDefinition=i}buildSteps(t,r){if(!t||t.length===0)return[];const i={cardId:this.cardId,effectId:this.effectId,sourceInstanceId:r.instanceId};return t.map(o=>Ae(o.step,o.args??{},i))}individualConditions(t,r){const i=this.dslDefinition.conditions;if(!i||!i.requirements||i.requirements.length===0)return f.Validation.success();for(const o of i.requirements){const s=Ve(o.step,t,r,o.args??{});if(!s.isValid)return s}return f.Validation.success()}individualActivationSteps(t,r){return this.buildSteps(this.dslDefinition.activations,r)}individualResolutionSteps(t,r){return this.buildSteps(this.dslDefinition.resolutions,r)}}function h_(e,n,t){return new m_(e,n,t)}class __ extends ft{constructor(t,r){super(t);C(this,"dslDefinition");this.dslDefinition=r}buildSteps(t,r){if(!t||t.length===0)return[];const i={cardId:this.cardId,sourceInstanceId:r.instanceId,effectId:this.effectId};return t.map(o=>Ae(o.step,o.args??{},i))}hasExplicitTargetSelection(){var t;return((t=this.dslDefinition.activations)==null?void 0:t.some(r=>r.step.startsWith("SELECT_TARGET_")||r.step.startsWith("SELECT_TARGETS_")))??!1}useDefaultEquipTargetSelection(){return!this.hasExplicitTargetSelection()}individualConditions(t,r){const i=this.dslDefinition.conditions;if(!i||!i.requirements||i.requirements.length===0)return f.Validation.success();for(const o of i.requirements){const s=Ve(o.step,t,r,o.args??{});if(!s.isValid)return s}return f.Validation.success()}individualActivationSteps(t,r){return this.buildSteps(this.dslDefinition.activations,r)}individualResolutionSteps(t,r){return this.buildSteps(this.dslDefinition.resolutions,r)}}function g_(e,n){return new __(e,n)}class S_ extends Pf{constructor(t,r,i){var s;super(t,r,i.spellSpeed??1);C(this,"triggers");C(this,"triggerTiming");C(this,"isMandatory");C(this,"selfOnly");C(this,"excludeSelf");C(this,"dslDefinition");this.dslDefinition=i;const o=(s=i.conditions)==null?void 0:s.trigger;this.triggers=(o==null?void 0:o.events)??[],this.triggerTiming=(o==null?void 0:o.timing)??"if",this.isMandatory=(o==null?void 0:o.isMandatory)??!0,this.selfOnly=(o==null?void 0:o.selfOnly)??!1,this.excludeSelf=(o==null?void 0:o.excludeSelf)??!1}buildSteps(t,r){if(!t||t.length===0)return[];const i={cardId:this.cardId,sourceInstanceId:r.instanceId};return t.map(o=>Ae(o.step,o.args??{},i))}individualConditions(t,r){var o;const i=(o=this.dslDefinition.conditions)==null?void 0:o.requirements;if(!i||i.length===0)return f.Validation.success();for(const s of i){const a=Ve(s.step,t,r,s.args??{});if(!a.isValid)return a}return f.Validation.success()}individualActivationSteps(t,r){return this.buildSteps(this.dslDefinition.activations,r)}individualResolutionSteps(t,r){return this.buildSteps(this.dslDefinition.resolutions,r)}}function v_(e,n,t){return new S_(e,n,t)}class E_{constructor(n){C(this,"cardId");C(this,"isEffect",!0);this.cardId=n}canApply(n){return this.isOnFieldFaceUp(n)?this.individualConditions(n):!1}isOnFieldFaceUp(n){return[...n.space.mainMonsterZone,...n.space.spellTrapZone,...n.space.fieldZone].some(r=>r.id===this.cardId&&E.Instance.isFaceUp(r))}}const y_=new Map([]);function C_(e){const n=y_.get(e);n&&n()}class A_ extends E_{constructor(t,r){var o;super(t);C(this,"category");C(this,"triggers");C(this,"triggerTiming");C(this,"isMandatory");C(this,"selfOnly");C(this,"triggerSourceZones");C(this,"dslDefinition");this.dslDefinition=r,this.category=r.category;const i=(o=r.conditions)==null?void 0:o.trigger;this.triggers=(i==null?void 0:i.events)??[],this.triggerTiming=(i==null?void 0:i.timing)??"if",this.isMandatory=(i==null?void 0:i.isMandatory)??!0,this.selfOnly=(i==null?void 0:i.selfOnly)??!1,this.triggerSourceZones=i==null?void 0:i.sourceZones}individualConditions(t){return!0}createTriggerSteps(t,r){const i=this.dslDefinition.resolutions??[],o={cardId:this.cardId,sourceInstanceId:r.instanceId};return i.map(s=>Ae(s.step,s.args??{},o))}}class T_{constructor(n){C(this,"cardId");C(this,"isEffect",!0);this.cardId=n}canApply(n){return this.individualConditions(n)}}class gn{static register(n,t){if(this.handlers.has(n))throw new Error(`Override "${n}" is already registered`);this.handlers.set(n,t)}static create(n,t){const r=this.handlers.get(n);if(!r)throw new Error(`Unknown override "${n}". Available overrides: ${this.getRegisteredNames().join(", ")}`);return r(t)}static isRegistered(n){return this.handlers.has(n)}static getRegisteredNames(){return Array.from(this.handlers.keys())}static clear(){this.handlers.clear()}}C(gn,"handlers",new Map);const I_=gn.create.bind(gn),O_=fi;gn.register(O_.FIELD_DEPARTURE_DESTINATION,bf);class R_ extends T_{constructor(t,r){super(t);C(this,"category","ActionOverride");C(this,"overrideName");C(this,"args");C(this,"handler");if(!r.override)throw new Error(`ActionOverride rule for card ID ${t} requires an "override" field`);this.overrideName=r.override,this.args=r.args??{},this.handler=I_(this.overrideName,t)}individualConditions(t){return!0}shouldApplyOverride(t,r){return this.handler.shouldApply(t,r,this.args)}getOverrideValue(){return this.handler.getOverrideValue(this.args)}}/*! js-yaml 4.1.1 https://github.com/nodeca/js-yaml @license MIT */function ki(e){return typeof e>"u"||e===null}function N_(e){return typeof e=="object"&&e!==null}function D_(e){return Array.isArray(e)?e:ki(e)?[]:[e]}function b_(e,n){var t,r,i,o;if(n)for(o=Object.keys(n),t=0,r=o.length;t<r;t+=1)i=o[t],e[i]=n[i];return e}function w_(e,n){var t="",r;for(r=0;r<n;r+=1)t+=e;return t}function k_(e){return e===0&&Number.NEGATIVE_INFINITY===1/e}var L_=ki,x_=N_,F_=D_,$_=w_,P_=k_,M_=b_,M={isNothing:L_,isObject:x_,toArray:F_,repeat:$_,isNegativeZero:P_,extend:M_};function Li(e,n){var t="",r=e.reason||"(unknown reason)";return e.mark?(e.mark.name&&(t+='in "'+e.mark.name+'" '),t+="("+(e.mark.line+1)+":"+(e.mark.column+1)+")",!n&&e.mark.snippet&&(t+=`

`+e.mark.snippet),r+" "+t):r}function Je(e,n){Error.call(this),this.name="YAMLException",this.reason=e,this.mark=n,this.message=Li(this,!1),Error.captureStackTrace?Error.captureStackTrace(this,this.constructor):this.stack=new Error().stack||""}Je.prototype=Object.create(Error.prototype);Je.prototype.constructor=Je;Je.prototype.toString=function(n){return this.name+": "+Li(this,n)};var B=Je;function $n(e,n,t,r,i){var o="",s="",a=Math.floor(i/2)-1;return r-n>a&&(o=" ... ",n=r-a+o.length),t-r>a&&(s=" ...",t=r+a-s.length),{str:o+e.slice(n,t).replace(/\t/g,"→")+s,pos:r-n+o.length}}function Pn(e,n){return M.repeat(" ",n-e.length)+e}function U_(e,n){if(n=Object.create(n||null),!e.buffer)return null;n.maxLength||(n.maxLength=79),typeof n.indent!="number"&&(n.indent=1),typeof n.linesBefore!="number"&&(n.linesBefore=3),typeof n.linesAfter!="number"&&(n.linesAfter=2);for(var t=/\r?\n|\r|\0/g,r=[0],i=[],o,s=-1;o=t.exec(e.buffer);)i.push(o.index),r.push(o.index+o[0].length),e.position<=o.index&&s<0&&(s=r.length-2);s<0&&(s=r.length-1);var a="",c,u,l=Math.min(e.line+n.linesAfter,i.length).toString().length,d=n.maxLength-(n.indent+l+3);for(c=1;c<=n.linesBefore&&!(s-c<0);c++)u=$n(e.buffer,r[s-c],i[s-c],e.position-(r[s]-r[s-c]),d),a=M.repeat(" ",n.indent)+Pn((e.line-c+1).toString(),l)+" | "+u.str+`
`+a;for(u=$n(e.buffer,r[s],i[s],e.position,d),a+=M.repeat(" ",n.indent)+Pn((e.line+1).toString(),l)+" | "+u.str+`
`,a+=M.repeat("-",n.indent+l+3+u.pos)+`^
`,c=1;c<=n.linesAfter&&!(s+c>=i.length);c++)u=$n(e.buffer,r[s+c],i[s+c],e.position-(r[s]-r[s+c]),d),a+=M.repeat(" ",n.indent)+Pn((e.line+c+1).toString(),l)+" | "+u.str+`
`;return a.replace(/\n$/,"")}var Z_=U_,z_=["kind","multi","resolve","construct","instanceOf","predicate","represent","representName","defaultStyle","styleAliases"],V_=["scalar","sequence","mapping"];function H_(e){var n={};return e!==null&&Object.keys(e).forEach(function(t){e[t].forEach(function(r){n[String(r)]=t})}),n}function q_(e,n){if(n=n||{},Object.keys(n).forEach(function(t){if(z_.indexOf(t)===-1)throw new B('Unknown option "'+t+'" is met in definition of "'+e+'" YAML type.')}),this.options=n,this.tag=e,this.kind=n.kind||null,this.resolve=n.resolve||function(){return!0},this.construct=n.construct||function(t){return t},this.instanceOf=n.instanceOf||null,this.predicate=n.predicate||null,this.represent=n.represent||null,this.representName=n.representName||null,this.defaultStyle=n.defaultStyle||null,this.multi=n.multi||!1,this.styleAliases=H_(n.styleAliases||null),V_.indexOf(this.kind)===-1)throw new B('Unknown kind "'+this.kind+'" is specified for "'+e+'" YAML type.')}var V=q_;function sr(e,n){var t=[];return e[n].forEach(function(r){var i=t.length;t.forEach(function(o,s){o.tag===r.tag&&o.kind===r.kind&&o.multi===r.multi&&(i=s)}),t[i]=r}),t}function G_(){var e={scalar:{},sequence:{},mapping:{},fallback:{},multi:{scalar:[],sequence:[],mapping:[],fallback:[]}},n,t;function r(i){i.multi?(e.multi[i.kind].push(i),e.multi.fallback.push(i)):e[i.kind][i.tag]=e.fallback[i.tag]=i}for(n=0,t=arguments.length;n<t;n+=1)arguments[n].forEach(r);return e}function Gn(e){return this.extend(e)}Gn.prototype.extend=function(n){var t=[],r=[];if(n instanceof V)r.push(n);else if(Array.isArray(n))r=r.concat(n);else if(n&&(Array.isArray(n.implicit)||Array.isArray(n.explicit)))n.implicit&&(t=t.concat(n.implicit)),n.explicit&&(r=r.concat(n.explicit));else throw new B("Schema.extend argument should be a Type, [ Type ], or a schema definition ({ implicit: [...], explicit: [...] })");t.forEach(function(o){if(!(o instanceof V))throw new B("Specified list of YAML types (or a single Type object) contains a non-Type object.");if(o.loadKind&&o.loadKind!=="scalar")throw new B("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.");if(o.multi)throw new B("There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.")}),r.forEach(function(o){if(!(o instanceof V))throw new B("Specified list of YAML types (or a single Type object) contains a non-Type object.")});var i=Object.create(Gn.prototype);return i.implicit=(this.implicit||[]).concat(t),i.explicit=(this.explicit||[]).concat(r),i.compiledImplicit=sr(i,"implicit"),i.compiledExplicit=sr(i,"explicit"),i.compiledTypeMap=G_(i.compiledImplicit,i.compiledExplicit),i};var xi=Gn,Fi=new V("tag:yaml.org,2002:str",{kind:"scalar",construct:function(e){return e!==null?e:""}}),$i=new V("tag:yaml.org,2002:seq",{kind:"sequence",construct:function(e){return e!==null?e:[]}}),Pi=new V("tag:yaml.org,2002:map",{kind:"mapping",construct:function(e){return e!==null?e:{}}}),Mi=new xi({explicit:[Fi,$i,Pi]});function j_(e){if(e===null)return!0;var n=e.length;return n===1&&e==="~"||n===4&&(e==="null"||e==="Null"||e==="NULL")}function B_(){return null}function Y_(e){return e===null}var Ui=new V("tag:yaml.org,2002:null",{kind:"scalar",resolve:j_,construct:B_,predicate:Y_,represent:{canonical:function(){return"~"},lowercase:function(){return"null"},uppercase:function(){return"NULL"},camelcase:function(){return"Null"},empty:function(){return""}},defaultStyle:"lowercase"});function K_(e){if(e===null)return!1;var n=e.length;return n===4&&(e==="true"||e==="True"||e==="TRUE")||n===5&&(e==="false"||e==="False"||e==="FALSE")}function W_(e){return e==="true"||e==="True"||e==="TRUE"}function J_(e){return Object.prototype.toString.call(e)==="[object Boolean]"}var Zi=new V("tag:yaml.org,2002:bool",{kind:"scalar",resolve:K_,construct:W_,predicate:J_,represent:{lowercase:function(e){return e?"true":"false"},uppercase:function(e){return e?"TRUE":"FALSE"},camelcase:function(e){return e?"True":"False"}},defaultStyle:"lowercase"});function X_(e){return 48<=e&&e<=57||65<=e&&e<=70||97<=e&&e<=102}function Q_(e){return 48<=e&&e<=55}function eg(e){return 48<=e&&e<=57}function ng(e){if(e===null)return!1;var n=e.length,t=0,r=!1,i;if(!n)return!1;if(i=e[t],(i==="-"||i==="+")&&(i=e[++t]),i==="0"){if(t+1===n)return!0;if(i=e[++t],i==="b"){for(t++;t<n;t++)if(i=e[t],i!=="_"){if(i!=="0"&&i!=="1")return!1;r=!0}return r&&i!=="_"}if(i==="x"){for(t++;t<n;t++)if(i=e[t],i!=="_"){if(!X_(e.charCodeAt(t)))return!1;r=!0}return r&&i!=="_"}if(i==="o"){for(t++;t<n;t++)if(i=e[t],i!=="_"){if(!Q_(e.charCodeAt(t)))return!1;r=!0}return r&&i!=="_"}}if(i==="_")return!1;for(;t<n;t++)if(i=e[t],i!=="_"){if(!eg(e.charCodeAt(t)))return!1;r=!0}return!(!r||i==="_")}function tg(e){var n=e,t=1,r;if(n.indexOf("_")!==-1&&(n=n.replace(/_/g,"")),r=n[0],(r==="-"||r==="+")&&(r==="-"&&(t=-1),n=n.slice(1),r=n[0]),n==="0")return 0;if(r==="0"){if(n[1]==="b")return t*parseInt(n.slice(2),2);if(n[1]==="x")return t*parseInt(n.slice(2),16);if(n[1]==="o")return t*parseInt(n.slice(2),8)}return t*parseInt(n,10)}function rg(e){return Object.prototype.toString.call(e)==="[object Number]"&&e%1===0&&!M.isNegativeZero(e)}var zi=new V("tag:yaml.org,2002:int",{kind:"scalar",resolve:ng,construct:tg,predicate:rg,represent:{binary:function(e){return e>=0?"0b"+e.toString(2):"-0b"+e.toString(2).slice(1)},octal:function(e){return e>=0?"0o"+e.toString(8):"-0o"+e.toString(8).slice(1)},decimal:function(e){return e.toString(10)},hexadecimal:function(e){return e>=0?"0x"+e.toString(16).toUpperCase():"-0x"+e.toString(16).toUpperCase().slice(1)}},defaultStyle:"decimal",styleAliases:{binary:[2,"bin"],octal:[8,"oct"],decimal:[10,"dec"],hexadecimal:[16,"hex"]}}),ig=new RegExp("^(?:[-+]?(?:[0-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$");function og(e){return!(e===null||!ig.test(e)||e[e.length-1]==="_")}function sg(e){var n,t;return n=e.replace(/_/g,"").toLowerCase(),t=n[0]==="-"?-1:1,"+-".indexOf(n[0])>=0&&(n=n.slice(1)),n===".inf"?t===1?Number.POSITIVE_INFINITY:Number.NEGATIVE_INFINITY:n===".nan"?NaN:t*parseFloat(n,10)}var ag=/^[-+]?[0-9]+e/;function cg(e,n){var t;if(isNaN(e))switch(n){case"lowercase":return".nan";case"uppercase":return".NAN";case"camelcase":return".NaN"}else if(Number.POSITIVE_INFINITY===e)switch(n){case"lowercase":return".inf";case"uppercase":return".INF";case"camelcase":return".Inf"}else if(Number.NEGATIVE_INFINITY===e)switch(n){case"lowercase":return"-.inf";case"uppercase":return"-.INF";case"camelcase":return"-.Inf"}else if(M.isNegativeZero(e))return"-0.0";return t=e.toString(10),ag.test(t)?t.replace("e",".e"):t}function ug(e){return Object.prototype.toString.call(e)==="[object Number]"&&(e%1!==0||M.isNegativeZero(e))}var Vi=new V("tag:yaml.org,2002:float",{kind:"scalar",resolve:og,construct:sg,predicate:ug,represent:cg,defaultStyle:"lowercase"}),Hi=Mi.extend({implicit:[Ui,Zi,zi,Vi]}),qi=Hi,Gi=new RegExp("^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"),ji=new RegExp("^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$");function lg(e){return e===null?!1:Gi.exec(e)!==null||ji.exec(e)!==null}function dg(e){var n,t,r,i,o,s,a,c=0,u=null,l,d,p;if(n=Gi.exec(e),n===null&&(n=ji.exec(e)),n===null)throw new Error("Date resolve error");if(t=+n[1],r=+n[2]-1,i=+n[3],!n[4])return new Date(Date.UTC(t,r,i));if(o=+n[4],s=+n[5],a=+n[6],n[7]){for(c=n[7].slice(0,3);c.length<3;)c+="0";c=+c}return n[9]&&(l=+n[10],d=+(n[11]||0),u=(l*60+d)*6e4,n[9]==="-"&&(u=-u)),p=new Date(Date.UTC(t,r,i,o,s,a,c)),u&&p.setTime(p.getTime()-u),p}function fg(e){return e.toISOString()}var Bi=new V("tag:yaml.org,2002:timestamp",{kind:"scalar",resolve:lg,construct:dg,instanceOf:Date,represent:fg});function pg(e){return e==="<<"||e===null}var Yi=new V("tag:yaml.org,2002:merge",{kind:"scalar",resolve:pg}),Ct=`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=
\r`;function mg(e){if(e===null)return!1;var n,t,r=0,i=e.length,o=Ct;for(t=0;t<i;t++)if(n=o.indexOf(e.charAt(t)),!(n>64)){if(n<0)return!1;r+=6}return r%8===0}function hg(e){var n,t,r=e.replace(/[\r\n=]/g,""),i=r.length,o=Ct,s=0,a=[];for(n=0;n<i;n++)n%4===0&&n&&(a.push(s>>16&255),a.push(s>>8&255),a.push(s&255)),s=s<<6|o.indexOf(r.charAt(n));return t=i%4*6,t===0?(a.push(s>>16&255),a.push(s>>8&255),a.push(s&255)):t===18?(a.push(s>>10&255),a.push(s>>2&255)):t===12&&a.push(s>>4&255),new Uint8Array(a)}function _g(e){var n="",t=0,r,i,o=e.length,s=Ct;for(r=0;r<o;r++)r%3===0&&r&&(n+=s[t>>18&63],n+=s[t>>12&63],n+=s[t>>6&63],n+=s[t&63]),t=(t<<8)+e[r];return i=o%3,i===0?(n+=s[t>>18&63],n+=s[t>>12&63],n+=s[t>>6&63],n+=s[t&63]):i===2?(n+=s[t>>10&63],n+=s[t>>4&63],n+=s[t<<2&63],n+=s[64]):i===1&&(n+=s[t>>2&63],n+=s[t<<4&63],n+=s[64],n+=s[64]),n}function gg(e){return Object.prototype.toString.call(e)==="[object Uint8Array]"}var Ki=new V("tag:yaml.org,2002:binary",{kind:"scalar",resolve:mg,construct:hg,predicate:gg,represent:_g}),Sg=Object.prototype.hasOwnProperty,vg=Object.prototype.toString;function Eg(e){if(e===null)return!0;var n=[],t,r,i,o,s,a=e;for(t=0,r=a.length;t<r;t+=1){if(i=a[t],s=!1,vg.call(i)!=="[object Object]")return!1;for(o in i)if(Sg.call(i,o))if(!s)s=!0;else return!1;if(!s)return!1;if(n.indexOf(o)===-1)n.push(o);else return!1}return!0}function yg(e){return e!==null?e:[]}var Wi=new V("tag:yaml.org,2002:omap",{kind:"sequence",resolve:Eg,construct:yg}),Cg=Object.prototype.toString;function Ag(e){if(e===null)return!0;var n,t,r,i,o,s=e;for(o=new Array(s.length),n=0,t=s.length;n<t;n+=1){if(r=s[n],Cg.call(r)!=="[object Object]"||(i=Object.keys(r),i.length!==1))return!1;o[n]=[i[0],r[i[0]]]}return!0}function Tg(e){if(e===null)return[];var n,t,r,i,o,s=e;for(o=new Array(s.length),n=0,t=s.length;n<t;n+=1)r=s[n],i=Object.keys(r),o[n]=[i[0],r[i[0]]];return o}var Ji=new V("tag:yaml.org,2002:pairs",{kind:"sequence",resolve:Ag,construct:Tg}),Ig=Object.prototype.hasOwnProperty;function Og(e){if(e===null)return!0;var n,t=e;for(n in t)if(Ig.call(t,n)&&t[n]!==null)return!1;return!0}function Rg(e){return e!==null?e:{}}var Xi=new V("tag:yaml.org,2002:set",{kind:"mapping",resolve:Og,construct:Rg}),At=qi.extend({implicit:[Bi,Yi],explicit:[Ki,Wi,Ji,Xi]}),Se=Object.prototype.hasOwnProperty,Sn=1,Qi=2,eo=3,vn=4,Mn=1,Ng=2,ar=3,Dg=/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/,bg=/[\x85\u2028\u2029]/,wg=/[,\[\]\{\}]/,no=/^(?:!|!!|![a-z\-]+!)$/i,to=/^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;function cr(e){return Object.prototype.toString.call(e)}function ce(e){return e===10||e===13}function ye(e){return e===9||e===32}function W(e){return e===9||e===32||e===10||e===13}function Ne(e){return e===44||e===91||e===93||e===123||e===125}function kg(e){var n;return 48<=e&&e<=57?e-48:(n=e|32,97<=n&&n<=102?n-97+10:-1)}function Lg(e){return e===120?2:e===117?4:e===85?8:0}function xg(e){return 48<=e&&e<=57?e-48:-1}function ur(e){return e===48?"\0":e===97?"\x07":e===98?"\b":e===116||e===9?"	":e===110?`
`:e===118?"\v":e===102?"\f":e===114?"\r":e===101?"\x1B":e===32?" ":e===34?'"':e===47?"/":e===92?"\\":e===78?"":e===95?" ":e===76?"\u2028":e===80?"\u2029":""}function Fg(e){return e<=65535?String.fromCharCode(e):String.fromCharCode((e-65536>>10)+55296,(e-65536&1023)+56320)}function ro(e,n,t){n==="__proto__"?Object.defineProperty(e,n,{configurable:!0,enumerable:!0,writable:!0,value:t}):e[n]=t}var io=new Array(256),oo=new Array(256);for(var Te=0;Te<256;Te++)io[Te]=ur(Te)?1:0,oo[Te]=ur(Te);function $g(e,n){this.input=e,this.filename=n.filename||null,this.schema=n.schema||At,this.onWarning=n.onWarning||null,this.legacy=n.legacy||!1,this.json=n.json||!1,this.listener=n.listener||null,this.implicitTypes=this.schema.compiledImplicit,this.typeMap=this.schema.compiledTypeMap,this.length=e.length,this.position=0,this.line=0,this.lineStart=0,this.lineIndent=0,this.firstTabInLine=-1,this.documents=[]}function so(e,n){var t={name:e.filename,buffer:e.input.slice(0,-1),position:e.position,line:e.line,column:e.position-e.lineStart};return t.snippet=Z_(t),new B(n,t)}function T(e,n){throw so(e,n)}function En(e,n){e.onWarning&&e.onWarning.call(null,so(e,n))}var lr={YAML:function(n,t,r){var i,o,s;n.version!==null&&T(n,"duplication of %YAML directive"),r.length!==1&&T(n,"YAML directive accepts exactly one argument"),i=/^([0-9]+)\.([0-9]+)$/.exec(r[0]),i===null&&T(n,"ill-formed argument of the YAML directive"),o=parseInt(i[1],10),s=parseInt(i[2],10),o!==1&&T(n,"unacceptable YAML version of the document"),n.version=r[0],n.checkLineBreaks=s<2,s!==1&&s!==2&&En(n,"unsupported YAML version of the document")},TAG:function(n,t,r){var i,o;r.length!==2&&T(n,"TAG directive accepts exactly two arguments"),i=r[0],o=r[1],no.test(i)||T(n,"ill-formed tag handle (first argument) of the TAG directive"),Se.call(n.tagMap,i)&&T(n,'there is a previously declared suffix for "'+i+'" tag handle'),to.test(o)||T(n,"ill-formed tag prefix (second argument) of the TAG directive");try{o=decodeURIComponent(o)}catch{T(n,"tag prefix is malformed: "+o)}n.tagMap[i]=o}};function he(e,n,t,r){var i,o,s,a;if(n<t){if(a=e.input.slice(n,t),r)for(i=0,o=a.length;i<o;i+=1)s=a.charCodeAt(i),s===9||32<=s&&s<=1114111||T(e,"expected valid JSON character");else Dg.test(a)&&T(e,"the stream contains non-printable characters");e.result+=a}}function dr(e,n,t,r){var i,o,s,a;for(M.isObject(t)||T(e,"cannot merge mappings; the provided source object is unacceptable"),i=Object.keys(t),s=0,a=i.length;s<a;s+=1)o=i[s],Se.call(n,o)||(ro(n,o,t[o]),r[o]=!0)}function De(e,n,t,r,i,o,s,a,c){var u,l;if(Array.isArray(i))for(i=Array.prototype.slice.call(i),u=0,l=i.length;u<l;u+=1)Array.isArray(i[u])&&T(e,"nested arrays are not supported inside keys"),typeof i=="object"&&cr(i[u])==="[object Object]"&&(i[u]="[object Object]");if(typeof i=="object"&&cr(i)==="[object Object]"&&(i="[object Object]"),i=String(i),n===null&&(n={}),r==="tag:yaml.org,2002:merge")if(Array.isArray(o))for(u=0,l=o.length;u<l;u+=1)dr(e,n,o[u],t);else dr(e,n,o,t);else!e.json&&!Se.call(t,i)&&Se.call(n,i)&&(e.line=s||e.line,e.lineStart=a||e.lineStart,e.position=c||e.position,T(e,"duplicated mapping key")),ro(n,i,o),delete t[i];return n}function Tt(e){var n;n=e.input.charCodeAt(e.position),n===10?e.position++:n===13?(e.position++,e.input.charCodeAt(e.position)===10&&e.position++):T(e,"a line break is expected"),e.line+=1,e.lineStart=e.position,e.firstTabInLine=-1}function $(e,n,t){for(var r=0,i=e.input.charCodeAt(e.position);i!==0;){for(;ye(i);)i===9&&e.firstTabInLine===-1&&(e.firstTabInLine=e.position),i=e.input.charCodeAt(++e.position);if(n&&i===35)do i=e.input.charCodeAt(++e.position);while(i!==10&&i!==13&&i!==0);if(ce(i))for(Tt(e),i=e.input.charCodeAt(e.position),r++,e.lineIndent=0;i===32;)e.lineIndent++,i=e.input.charCodeAt(++e.position);else break}return t!==-1&&r!==0&&e.lineIndent<t&&En(e,"deficient indentation"),r}function Dn(e){var n=e.position,t;return t=e.input.charCodeAt(n),!!((t===45||t===46)&&t===e.input.charCodeAt(n+1)&&t===e.input.charCodeAt(n+2)&&(n+=3,t=e.input.charCodeAt(n),t===0||W(t)))}function It(e,n){n===1?e.result+=" ":n>1&&(e.result+=M.repeat(`
`,n-1))}function Pg(e,n,t){var r,i,o,s,a,c,u,l,d=e.kind,p=e.result,m;if(m=e.input.charCodeAt(e.position),W(m)||Ne(m)||m===35||m===38||m===42||m===33||m===124||m===62||m===39||m===34||m===37||m===64||m===96||(m===63||m===45)&&(i=e.input.charCodeAt(e.position+1),W(i)||t&&Ne(i)))return!1;for(e.kind="scalar",e.result="",o=s=e.position,a=!1;m!==0;){if(m===58){if(i=e.input.charCodeAt(e.position+1),W(i)||t&&Ne(i))break}else if(m===35){if(r=e.input.charCodeAt(e.position-1),W(r))break}else{if(e.position===e.lineStart&&Dn(e)||t&&Ne(m))break;if(ce(m))if(c=e.line,u=e.lineStart,l=e.lineIndent,$(e,!1,-1),e.lineIndent>=n){a=!0,m=e.input.charCodeAt(e.position);continue}else{e.position=s,e.line=c,e.lineStart=u,e.lineIndent=l;break}}a&&(he(e,o,s,!1),It(e,e.line-c),o=s=e.position,a=!1),ye(m)||(s=e.position+1),m=e.input.charCodeAt(++e.position)}return he(e,o,s,!1),e.result?!0:(e.kind=d,e.result=p,!1)}function Mg(e,n){var t,r,i;if(t=e.input.charCodeAt(e.position),t!==39)return!1;for(e.kind="scalar",e.result="",e.position++,r=i=e.position;(t=e.input.charCodeAt(e.position))!==0;)if(t===39)if(he(e,r,e.position,!0),t=e.input.charCodeAt(++e.position),t===39)r=e.position,e.position++,i=e.position;else return!0;else ce(t)?(he(e,r,i,!0),It(e,$(e,!1,n)),r=i=e.position):e.position===e.lineStart&&Dn(e)?T(e,"unexpected end of the document within a single quoted scalar"):(e.position++,i=e.position);T(e,"unexpected end of the stream within a single quoted scalar")}function Ug(e,n){var t,r,i,o,s,a;if(a=e.input.charCodeAt(e.position),a!==34)return!1;for(e.kind="scalar",e.result="",e.position++,t=r=e.position;(a=e.input.charCodeAt(e.position))!==0;){if(a===34)return he(e,t,e.position,!0),e.position++,!0;if(a===92){if(he(e,t,e.position,!0),a=e.input.charCodeAt(++e.position),ce(a))$(e,!1,n);else if(a<256&&io[a])e.result+=oo[a],e.position++;else if((s=Lg(a))>0){for(i=s,o=0;i>0;i--)a=e.input.charCodeAt(++e.position),(s=kg(a))>=0?o=(o<<4)+s:T(e,"expected hexadecimal character");e.result+=Fg(o),e.position++}else T(e,"unknown escape sequence");t=r=e.position}else ce(a)?(he(e,t,r,!0),It(e,$(e,!1,n)),t=r=e.position):e.position===e.lineStart&&Dn(e)?T(e,"unexpected end of the document within a double quoted scalar"):(e.position++,r=e.position)}T(e,"unexpected end of the stream within a double quoted scalar")}function Zg(e,n){var t=!0,r,i,o,s=e.tag,a,c=e.anchor,u,l,d,p,m,g=Object.create(null),v,y,N,A;if(A=e.input.charCodeAt(e.position),A===91)l=93,m=!1,a=[];else if(A===123)l=125,m=!0,a={};else return!1;for(e.anchor!==null&&(e.anchorMap[e.anchor]=a),A=e.input.charCodeAt(++e.position);A!==0;){if($(e,!0,n),A=e.input.charCodeAt(e.position),A===l)return e.position++,e.tag=s,e.anchor=c,e.kind=m?"mapping":"sequence",e.result=a,!0;t?A===44&&T(e,"expected the node content, but found ','"):T(e,"missed comma between flow collection entries"),y=v=N=null,d=p=!1,A===63&&(u=e.input.charCodeAt(e.position+1),W(u)&&(d=p=!0,e.position++,$(e,!0,n))),r=e.line,i=e.lineStart,o=e.position,xe(e,n,Sn,!1,!0),y=e.tag,v=e.result,$(e,!0,n),A=e.input.charCodeAt(e.position),(p||e.line===r)&&A===58&&(d=!0,A=e.input.charCodeAt(++e.position),$(e,!0,n),xe(e,n,Sn,!1,!0),N=e.result),m?De(e,a,g,y,v,N,r,i,o):d?a.push(De(e,null,g,y,v,N,r,i,o)):a.push(v),$(e,!0,n),A=e.input.charCodeAt(e.position),A===44?(t=!0,A=e.input.charCodeAt(++e.position)):t=!1}T(e,"unexpected end of the stream within a flow collection")}function zg(e,n){var t,r,i=Mn,o=!1,s=!1,a=n,c=0,u=!1,l,d;if(d=e.input.charCodeAt(e.position),d===124)r=!1;else if(d===62)r=!0;else return!1;for(e.kind="scalar",e.result="";d!==0;)if(d=e.input.charCodeAt(++e.position),d===43||d===45)Mn===i?i=d===43?ar:Ng:T(e,"repeat of a chomping mode identifier");else if((l=xg(d))>=0)l===0?T(e,"bad explicit indentation width of a block scalar; it cannot be less than one"):s?T(e,"repeat of an indentation width identifier"):(a=n+l-1,s=!0);else break;if(ye(d)){do d=e.input.charCodeAt(++e.position);while(ye(d));if(d===35)do d=e.input.charCodeAt(++e.position);while(!ce(d)&&d!==0)}for(;d!==0;){for(Tt(e),e.lineIndent=0,d=e.input.charCodeAt(e.position);(!s||e.lineIndent<a)&&d===32;)e.lineIndent++,d=e.input.charCodeAt(++e.position);if(!s&&e.lineIndent>a&&(a=e.lineIndent),ce(d)){c++;continue}if(e.lineIndent<a){i===ar?e.result+=M.repeat(`
`,o?1+c:c):i===Mn&&o&&(e.result+=`
`);break}for(r?ye(d)?(u=!0,e.result+=M.repeat(`
`,o?1+c:c)):u?(u=!1,e.result+=M.repeat(`
`,c+1)):c===0?o&&(e.result+=" "):e.result+=M.repeat(`
`,c):e.result+=M.repeat(`
`,o?1+c:c),o=!0,s=!0,c=0,t=e.position;!ce(d)&&d!==0;)d=e.input.charCodeAt(++e.position);he(e,t,e.position,!1)}return!0}function fr(e,n){var t,r=e.tag,i=e.anchor,o=[],s,a=!1,c;if(e.firstTabInLine!==-1)return!1;for(e.anchor!==null&&(e.anchorMap[e.anchor]=o),c=e.input.charCodeAt(e.position);c!==0&&(e.firstTabInLine!==-1&&(e.position=e.firstTabInLine,T(e,"tab characters must not be used in indentation")),!(c!==45||(s=e.input.charCodeAt(e.position+1),!W(s))));){if(a=!0,e.position++,$(e,!0,-1)&&e.lineIndent<=n){o.push(null),c=e.input.charCodeAt(e.position);continue}if(t=e.line,xe(e,n,eo,!1,!0),o.push(e.result),$(e,!0,-1),c=e.input.charCodeAt(e.position),(e.line===t||e.lineIndent>n)&&c!==0)T(e,"bad indentation of a sequence entry");else if(e.lineIndent<n)break}return a?(e.tag=r,e.anchor=i,e.kind="sequence",e.result=o,!0):!1}function Vg(e,n,t){var r,i,o,s,a,c,u=e.tag,l=e.anchor,d={},p=Object.create(null),m=null,g=null,v=null,y=!1,N=!1,A;if(e.firstTabInLine!==-1)return!1;for(e.anchor!==null&&(e.anchorMap[e.anchor]=d),A=e.input.charCodeAt(e.position);A!==0;){if(!y&&e.firstTabInLine!==-1&&(e.position=e.firstTabInLine,T(e,"tab characters must not be used in indentation")),r=e.input.charCodeAt(e.position+1),o=e.line,(A===63||A===58)&&W(r))A===63?(y&&(De(e,d,p,m,g,null,s,a,c),m=g=v=null),N=!0,y=!0,i=!0):y?(y=!1,i=!0):T(e,"incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line"),e.position+=1,A=r;else{if(s=e.line,a=e.lineStart,c=e.position,!xe(e,t,Qi,!1,!0))break;if(e.line===o){for(A=e.input.charCodeAt(e.position);ye(A);)A=e.input.charCodeAt(++e.position);if(A===58)A=e.input.charCodeAt(++e.position),W(A)||T(e,"a whitespace character is expected after the key-value separator within a block mapping"),y&&(De(e,d,p,m,g,null,s,a,c),m=g=v=null),N=!0,y=!1,i=!1,m=e.tag,g=e.result;else if(N)T(e,"can not read an implicit mapping pair; a colon is missed");else return e.tag=u,e.anchor=l,!0}else if(N)T(e,"can not read a block mapping entry; a multiline key may not be an implicit key");else return e.tag=u,e.anchor=l,!0}if((e.line===o||e.lineIndent>n)&&(y&&(s=e.line,a=e.lineStart,c=e.position),xe(e,n,vn,!0,i)&&(y?g=e.result:v=e.result),y||(De(e,d,p,m,g,v,s,a,c),m=g=v=null),$(e,!0,-1),A=e.input.charCodeAt(e.position)),(e.line===o||e.lineIndent>n)&&A!==0)T(e,"bad indentation of a mapping entry");else if(e.lineIndent<n)break}return y&&De(e,d,p,m,g,null,s,a,c),N&&(e.tag=u,e.anchor=l,e.kind="mapping",e.result=d),N}function Hg(e){var n,t=!1,r=!1,i,o,s;if(s=e.input.charCodeAt(e.position),s!==33)return!1;if(e.tag!==null&&T(e,"duplication of a tag property"),s=e.input.charCodeAt(++e.position),s===60?(t=!0,s=e.input.charCodeAt(++e.position)):s===33?(r=!0,i="!!",s=e.input.charCodeAt(++e.position)):i="!",n=e.position,t){do s=e.input.charCodeAt(++e.position);while(s!==0&&s!==62);e.position<e.length?(o=e.input.slice(n,e.position),s=e.input.charCodeAt(++e.position)):T(e,"unexpected end of the stream within a verbatim tag")}else{for(;s!==0&&!W(s);)s===33&&(r?T(e,"tag suffix cannot contain exclamation marks"):(i=e.input.slice(n-1,e.position+1),no.test(i)||T(e,"named tag handle cannot contain such characters"),r=!0,n=e.position+1)),s=e.input.charCodeAt(++e.position);o=e.input.slice(n,e.position),wg.test(o)&&T(e,"tag suffix cannot contain flow indicator characters")}o&&!to.test(o)&&T(e,"tag name cannot contain such characters: "+o);try{o=decodeURIComponent(o)}catch{T(e,"tag name is malformed: "+o)}return t?e.tag=o:Se.call(e.tagMap,i)?e.tag=e.tagMap[i]+o:i==="!"?e.tag="!"+o:i==="!!"?e.tag="tag:yaml.org,2002:"+o:T(e,'undeclared tag handle "'+i+'"'),!0}function qg(e){var n,t;if(t=e.input.charCodeAt(e.position),t!==38)return!1;for(e.anchor!==null&&T(e,"duplication of an anchor property"),t=e.input.charCodeAt(++e.position),n=e.position;t!==0&&!W(t)&&!Ne(t);)t=e.input.charCodeAt(++e.position);return e.position===n&&T(e,"name of an anchor node must contain at least one character"),e.anchor=e.input.slice(n,e.position),!0}function Gg(e){var n,t,r;if(r=e.input.charCodeAt(e.position),r!==42)return!1;for(r=e.input.charCodeAt(++e.position),n=e.position;r!==0&&!W(r)&&!Ne(r);)r=e.input.charCodeAt(++e.position);return e.position===n&&T(e,"name of an alias node must contain at least one character"),t=e.input.slice(n,e.position),Se.call(e.anchorMap,t)||T(e,'unidentified alias "'+t+'"'),e.result=e.anchorMap[t],$(e,!0,-1),!0}function xe(e,n,t,r,i){var o,s,a,c=1,u=!1,l=!1,d,p,m,g,v,y;if(e.listener!==null&&e.listener("open",e),e.tag=null,e.anchor=null,e.kind=null,e.result=null,o=s=a=vn===t||eo===t,r&&$(e,!0,-1)&&(u=!0,e.lineIndent>n?c=1:e.lineIndent===n?c=0:e.lineIndent<n&&(c=-1)),c===1)for(;Hg(e)||qg(e);)$(e,!0,-1)?(u=!0,a=o,e.lineIndent>n?c=1:e.lineIndent===n?c=0:e.lineIndent<n&&(c=-1)):a=!1;if(a&&(a=u||i),(c===1||vn===t)&&(Sn===t||Qi===t?v=n:v=n+1,y=e.position-e.lineStart,c===1?a&&(fr(e,y)||Vg(e,y,v))||Zg(e,v)?l=!0:(s&&zg(e,v)||Mg(e,v)||Ug(e,v)?l=!0:Gg(e)?(l=!0,(e.tag!==null||e.anchor!==null)&&T(e,"alias node should not have any properties")):Pg(e,v,Sn===t)&&(l=!0,e.tag===null&&(e.tag="?")),e.anchor!==null&&(e.anchorMap[e.anchor]=e.result)):c===0&&(l=a&&fr(e,y))),e.tag===null)e.anchor!==null&&(e.anchorMap[e.anchor]=e.result);else if(e.tag==="?"){for(e.result!==null&&e.kind!=="scalar"&&T(e,'unacceptable node kind for !<?> tag; it should be "scalar", not "'+e.kind+'"'),d=0,p=e.implicitTypes.length;d<p;d+=1)if(g=e.implicitTypes[d],g.resolve(e.result)){e.result=g.construct(e.result),e.tag=g.tag,e.anchor!==null&&(e.anchorMap[e.anchor]=e.result);break}}else if(e.tag!=="!"){if(Se.call(e.typeMap[e.kind||"fallback"],e.tag))g=e.typeMap[e.kind||"fallback"][e.tag];else for(g=null,m=e.typeMap.multi[e.kind||"fallback"],d=0,p=m.length;d<p;d+=1)if(e.tag.slice(0,m[d].tag.length)===m[d].tag){g=m[d];break}g||T(e,"unknown tag !<"+e.tag+">"),e.result!==null&&g.kind!==e.kind&&T(e,"unacceptable node kind for !<"+e.tag+'> tag; it should be "'+g.kind+'", not "'+e.kind+'"'),g.resolve(e.result,e.tag)?(e.result=g.construct(e.result,e.tag),e.anchor!==null&&(e.anchorMap[e.anchor]=e.result)):T(e,"cannot resolve a node with !<"+e.tag+"> explicit tag")}return e.listener!==null&&e.listener("close",e),e.tag!==null||e.anchor!==null||l}function jg(e){var n=e.position,t,r,i,o=!1,s;for(e.version=null,e.checkLineBreaks=e.legacy,e.tagMap=Object.create(null),e.anchorMap=Object.create(null);(s=e.input.charCodeAt(e.position))!==0&&($(e,!0,-1),s=e.input.charCodeAt(e.position),!(e.lineIndent>0||s!==37));){for(o=!0,s=e.input.charCodeAt(++e.position),t=e.position;s!==0&&!W(s);)s=e.input.charCodeAt(++e.position);for(r=e.input.slice(t,e.position),i=[],r.length<1&&T(e,"directive name must not be less than one character in length");s!==0;){for(;ye(s);)s=e.input.charCodeAt(++e.position);if(s===35){do s=e.input.charCodeAt(++e.position);while(s!==0&&!ce(s));break}if(ce(s))break;for(t=e.position;s!==0&&!W(s);)s=e.input.charCodeAt(++e.position);i.push(e.input.slice(t,e.position))}s!==0&&Tt(e),Se.call(lr,r)?lr[r](e,r,i):En(e,'unknown document directive "'+r+'"')}if($(e,!0,-1),e.lineIndent===0&&e.input.charCodeAt(e.position)===45&&e.input.charCodeAt(e.position+1)===45&&e.input.charCodeAt(e.position+2)===45?(e.position+=3,$(e,!0,-1)):o&&T(e,"directives end mark is expected"),xe(e,e.lineIndent-1,vn,!1,!0),$(e,!0,-1),e.checkLineBreaks&&bg.test(e.input.slice(n,e.position))&&En(e,"non-ASCII line breaks are interpreted as content"),e.documents.push(e.result),e.position===e.lineStart&&Dn(e)){e.input.charCodeAt(e.position)===46&&(e.position+=3,$(e,!0,-1));return}if(e.position<e.length-1)T(e,"end of the stream or a document separator is expected");else return}function ao(e,n){e=String(e),n=n||{},e.length!==0&&(e.charCodeAt(e.length-1)!==10&&e.charCodeAt(e.length-1)!==13&&(e+=`
`),e.charCodeAt(0)===65279&&(e=e.slice(1)));var t=new $g(e,n),r=e.indexOf("\0");for(r!==-1&&(t.position=r,T(t,"null byte is not allowed in input")),t.input+="\0";t.input.charCodeAt(t.position)===32;)t.lineIndent+=1,t.position+=1;for(;t.position<t.length-1;)jg(t);return t.documents}function Bg(e,n,t){n!==null&&typeof n=="object"&&typeof t>"u"&&(t=n,n=null);var r=ao(e,t);if(typeof n!="function")return r;for(var i=0,o=r.length;i<o;i+=1)n(r[i])}function Yg(e,n){var t=ao(e,n);if(t.length!==0){if(t.length===1)return t[0];throw new B("expected a single document in the stream, but found more")}}var Kg=Bg,Wg=Yg,co={loadAll:Kg,load:Wg},uo=Object.prototype.toString,lo=Object.prototype.hasOwnProperty,Ot=65279,Jg=9,Xe=10,Xg=13,Qg=32,eS=33,nS=34,jn=35,tS=37,rS=38,iS=39,oS=42,fo=44,sS=45,yn=58,aS=61,cS=62,uS=63,lS=64,po=91,mo=93,dS=96,ho=123,fS=124,_o=125,q={};q[0]="\\0";q[7]="\\a";q[8]="\\b";q[9]="\\t";q[10]="\\n";q[11]="\\v";q[12]="\\f";q[13]="\\r";q[27]="\\e";q[34]='\\"';q[92]="\\\\";q[133]="\\N";q[160]="\\_";q[8232]="\\L";q[8233]="\\P";var pS=["y","Y","yes","Yes","YES","on","On","ON","n","N","no","No","NO","off","Off","OFF"],mS=/^[-+]?[0-9_]+(?::[0-9_]+)+(?:\.[0-9_]*)?$/;function hS(e,n){var t,r,i,o,s,a,c;if(n===null)return{};for(t={},r=Object.keys(n),i=0,o=r.length;i<o;i+=1)s=r[i],a=String(n[s]),s.slice(0,2)==="!!"&&(s="tag:yaml.org,2002:"+s.slice(2)),c=e.compiledTypeMap.fallback[s],c&&lo.call(c.styleAliases,a)&&(a=c.styleAliases[a]),t[s]=a;return t}function _S(e){var n,t,r;if(n=e.toString(16).toUpperCase(),e<=255)t="x",r=2;else if(e<=65535)t="u",r=4;else if(e<=4294967295)t="U",r=8;else throw new B("code point within a string may not be greater than 0xFFFFFFFF");return"\\"+t+M.repeat("0",r-n.length)+n}var gS=1,Qe=2;function SS(e){this.schema=e.schema||At,this.indent=Math.max(1,e.indent||2),this.noArrayIndent=e.noArrayIndent||!1,this.skipInvalid=e.skipInvalid||!1,this.flowLevel=M.isNothing(e.flowLevel)?-1:e.flowLevel,this.styleMap=hS(this.schema,e.styles||null),this.sortKeys=e.sortKeys||!1,this.lineWidth=e.lineWidth||80,this.noRefs=e.noRefs||!1,this.noCompatMode=e.noCompatMode||!1,this.condenseFlow=e.condenseFlow||!1,this.quotingType=e.quotingType==='"'?Qe:gS,this.forceQuotes=e.forceQuotes||!1,this.replacer=typeof e.replacer=="function"?e.replacer:null,this.implicitTypes=this.schema.compiledImplicit,this.explicitTypes=this.schema.compiledExplicit,this.tag=null,this.result="",this.duplicates=[],this.usedDuplicates=null}function pr(e,n){for(var t=M.repeat(" ",n),r=0,i=-1,o="",s,a=e.length;r<a;)i=e.indexOf(`
`,r),i===-1?(s=e.slice(r),r=a):(s=e.slice(r,i+1),r=i+1),s.length&&s!==`
`&&(o+=t),o+=s;return o}function Bn(e,n){return`
`+M.repeat(" ",e.indent*n)}function vS(e,n){var t,r,i;for(t=0,r=e.implicitTypes.length;t<r;t+=1)if(i=e.implicitTypes[t],i.resolve(n))return!0;return!1}function Cn(e){return e===Qg||e===Jg}function en(e){return 32<=e&&e<=126||161<=e&&e<=55295&&e!==8232&&e!==8233||57344<=e&&e<=65533&&e!==Ot||65536<=e&&e<=1114111}function mr(e){return en(e)&&e!==Ot&&e!==Xg&&e!==Xe}function hr(e,n,t){var r=mr(e),i=r&&!Cn(e);return(t?r:r&&e!==fo&&e!==po&&e!==mo&&e!==ho&&e!==_o)&&e!==jn&&!(n===yn&&!i)||mr(n)&&!Cn(n)&&e===jn||n===yn&&i}function ES(e){return en(e)&&e!==Ot&&!Cn(e)&&e!==sS&&e!==uS&&e!==yn&&e!==fo&&e!==po&&e!==mo&&e!==ho&&e!==_o&&e!==jn&&e!==rS&&e!==oS&&e!==eS&&e!==fS&&e!==aS&&e!==cS&&e!==iS&&e!==nS&&e!==tS&&e!==lS&&e!==dS}function yS(e){return!Cn(e)&&e!==yn}function je(e,n){var t=e.charCodeAt(n),r;return t>=55296&&t<=56319&&n+1<e.length&&(r=e.charCodeAt(n+1),r>=56320&&r<=57343)?(t-55296)*1024+r-56320+65536:t}function go(e){var n=/^\n* /;return n.test(e)}var So=1,Yn=2,vo=3,Eo=4,Ie=5;function CS(e,n,t,r,i,o,s,a){var c,u=0,l=null,d=!1,p=!1,m=r!==-1,g=-1,v=ES(je(e,0))&&yS(je(e,e.length-1));if(n||s)for(c=0;c<e.length;u>=65536?c+=2:c++){if(u=je(e,c),!en(u))return Ie;v=v&&hr(u,l,a),l=u}else{for(c=0;c<e.length;u>=65536?c+=2:c++){if(u=je(e,c),u===Xe)d=!0,m&&(p=p||c-g-1>r&&e[g+1]!==" ",g=c);else if(!en(u))return Ie;v=v&&hr(u,l,a),l=u}p=p||m&&c-g-1>r&&e[g+1]!==" "}return!d&&!p?v&&!s&&!i(e)?So:o===Qe?Ie:Yn:t>9&&go(e)?Ie:s?o===Qe?Ie:Yn:p?Eo:vo}function AS(e,n,t,r,i){e.dump=function(){if(n.length===0)return e.quotingType===Qe?'""':"''";if(!e.noCompatMode&&(pS.indexOf(n)!==-1||mS.test(n)))return e.quotingType===Qe?'"'+n+'"':"'"+n+"'";var o=e.indent*Math.max(1,t),s=e.lineWidth===-1?-1:Math.max(Math.min(e.lineWidth,40),e.lineWidth-o),a=r||e.flowLevel>-1&&t>=e.flowLevel;function c(u){return vS(e,u)}switch(CS(n,a,e.indent,s,c,e.quotingType,e.forceQuotes&&!r,i)){case So:return n;case Yn:return"'"+n.replace(/'/g,"''")+"'";case vo:return"|"+_r(n,e.indent)+gr(pr(n,o));case Eo:return">"+_r(n,e.indent)+gr(pr(TS(n,s),o));case Ie:return'"'+IS(n)+'"';default:throw new B("impossible error: invalid scalar style")}}()}function _r(e,n){var t=go(e)?String(n):"",r=e[e.length-1]===`
`,i=r&&(e[e.length-2]===`
`||e===`
`),o=i?"+":r?"":"-";return t+o+`
`}function gr(e){return e[e.length-1]===`
`?e.slice(0,-1):e}function TS(e,n){for(var t=/(\n+)([^\n]*)/g,r=function(){var u=e.indexOf(`
`);return u=u!==-1?u:e.length,t.lastIndex=u,Sr(e.slice(0,u),n)}(),i=e[0]===`
`||e[0]===" ",o,s;s=t.exec(e);){var a=s[1],c=s[2];o=c[0]===" ",r+=a+(!i&&!o&&c!==""?`
`:"")+Sr(c,n),i=o}return r}function Sr(e,n){if(e===""||e[0]===" ")return e;for(var t=/ [^ ]/g,r,i=0,o,s=0,a=0,c="";r=t.exec(e);)a=r.index,a-i>n&&(o=s>i?s:a,c+=`
`+e.slice(i,o),i=o+1),s=a;return c+=`
`,e.length-i>n&&s>i?c+=e.slice(i,s)+`
`+e.slice(s+1):c+=e.slice(i),c.slice(1)}function IS(e){for(var n="",t=0,r,i=0;i<e.length;t>=65536?i+=2:i++)t=je(e,i),r=q[t],!r&&en(t)?(n+=e[i],t>=65536&&(n+=e[i+1])):n+=r||_S(t);return n}function OS(e,n,t){var r="",i=e.tag,o,s,a;for(o=0,s=t.length;o<s;o+=1)a=t[o],e.replacer&&(a=e.replacer.call(t,String(o),a)),(pe(e,n,a,!1,!1)||typeof a>"u"&&pe(e,n,null,!1,!1))&&(r!==""&&(r+=","+(e.condenseFlow?"":" ")),r+=e.dump);e.tag=i,e.dump="["+r+"]"}function vr(e,n,t,r){var i="",o=e.tag,s,a,c;for(s=0,a=t.length;s<a;s+=1)c=t[s],e.replacer&&(c=e.replacer.call(t,String(s),c)),(pe(e,n+1,c,!0,!0,!1,!0)||typeof c>"u"&&pe(e,n+1,null,!0,!0,!1,!0))&&((!r||i!=="")&&(i+=Bn(e,n)),e.dump&&Xe===e.dump.charCodeAt(0)?i+="-":i+="- ",i+=e.dump);e.tag=o,e.dump=i||"[]"}function RS(e,n,t){var r="",i=e.tag,o=Object.keys(t),s,a,c,u,l;for(s=0,a=o.length;s<a;s+=1)l="",r!==""&&(l+=", "),e.condenseFlow&&(l+='"'),c=o[s],u=t[c],e.replacer&&(u=e.replacer.call(t,c,u)),pe(e,n,c,!1,!1)&&(e.dump.length>1024&&(l+="? "),l+=e.dump+(e.condenseFlow?'"':"")+":"+(e.condenseFlow?"":" "),pe(e,n,u,!1,!1)&&(l+=e.dump,r+=l));e.tag=i,e.dump="{"+r+"}"}function NS(e,n,t,r){var i="",o=e.tag,s=Object.keys(t),a,c,u,l,d,p;if(e.sortKeys===!0)s.sort();else if(typeof e.sortKeys=="function")s.sort(e.sortKeys);else if(e.sortKeys)throw new B("sortKeys must be a boolean or a function");for(a=0,c=s.length;a<c;a+=1)p="",(!r||i!=="")&&(p+=Bn(e,n)),u=s[a],l=t[u],e.replacer&&(l=e.replacer.call(t,u,l)),pe(e,n+1,u,!0,!0,!0)&&(d=e.tag!==null&&e.tag!=="?"||e.dump&&e.dump.length>1024,d&&(e.dump&&Xe===e.dump.charCodeAt(0)?p+="?":p+="? "),p+=e.dump,d&&(p+=Bn(e,n)),pe(e,n+1,l,!0,d)&&(e.dump&&Xe===e.dump.charCodeAt(0)?p+=":":p+=": ",p+=e.dump,i+=p));e.tag=o,e.dump=i||"{}"}function Er(e,n,t){var r,i,o,s,a,c;for(i=t?e.explicitTypes:e.implicitTypes,o=0,s=i.length;o<s;o+=1)if(a=i[o],(a.instanceOf||a.predicate)&&(!a.instanceOf||typeof n=="object"&&n instanceof a.instanceOf)&&(!a.predicate||a.predicate(n))){if(t?a.multi&&a.representName?e.tag=a.representName(n):e.tag=a.tag:e.tag="?",a.represent){if(c=e.styleMap[a.tag]||a.defaultStyle,uo.call(a.represent)==="[object Function]")r=a.represent(n,c);else if(lo.call(a.represent,c))r=a.represent[c](n,c);else throw new B("!<"+a.tag+'> tag resolver accepts not "'+c+'" style');e.dump=r}return!0}return!1}function pe(e,n,t,r,i,o,s){e.tag=null,e.dump=t,Er(e,t,!1)||Er(e,t,!0);var a=uo.call(e.dump),c=r,u;r&&(r=e.flowLevel<0||e.flowLevel>n);var l=a==="[object Object]"||a==="[object Array]",d,p;if(l&&(d=e.duplicates.indexOf(t),p=d!==-1),(e.tag!==null&&e.tag!=="?"||p||e.indent!==2&&n>0)&&(i=!1),p&&e.usedDuplicates[d])e.dump="*ref_"+d;else{if(l&&p&&!e.usedDuplicates[d]&&(e.usedDuplicates[d]=!0),a==="[object Object]")r&&Object.keys(e.dump).length!==0?(NS(e,n,e.dump,i),p&&(e.dump="&ref_"+d+e.dump)):(RS(e,n,e.dump),p&&(e.dump="&ref_"+d+" "+e.dump));else if(a==="[object Array]")r&&e.dump.length!==0?(e.noArrayIndent&&!s&&n>0?vr(e,n-1,e.dump,i):vr(e,n,e.dump,i),p&&(e.dump="&ref_"+d+e.dump)):(OS(e,n,e.dump),p&&(e.dump="&ref_"+d+" "+e.dump));else if(a==="[object String]")e.tag!=="?"&&AS(e,e.dump,n,o,c);else{if(a==="[object Undefined]")return!1;if(e.skipInvalid)return!1;throw new B("unacceptable kind of an object to dump "+a)}e.tag!==null&&e.tag!=="?"&&(u=encodeURI(e.tag[0]==="!"?e.tag.slice(1):e.tag).replace(/!/g,"%21"),e.tag[0]==="!"?u="!"+u:u.slice(0,18)==="tag:yaml.org,2002:"?u="!!"+u.slice(18):u="!<"+u+">",e.dump=u+" "+e.dump)}return!0}function DS(e,n){var t=[],r=[],i,o;for(Kn(e,t,r),i=0,o=r.length;i<o;i+=1)n.duplicates.push(t[r[i]]);n.usedDuplicates=new Array(o)}function Kn(e,n,t){var r,i,o;if(e!==null&&typeof e=="object")if(i=n.indexOf(e),i!==-1)t.indexOf(i)===-1&&t.push(i);else if(n.push(e),Array.isArray(e))for(i=0,o=e.length;i<o;i+=1)Kn(e[i],n,t);else for(r=Object.keys(e),i=0,o=r.length;i<o;i+=1)Kn(e[r[i]],n,t)}function bS(e,n){n=n||{};var t=new SS(n);t.noRefs||DS(e,t);var r=e;return t.replacer&&(r=t.replacer.call({"":r},"",r)),pe(t,0,r,!0,!0)?t.dump+`
`:""}var wS=bS,kS={dump:wS};function Rt(e,n){return function(){throw new Error("Function yaml."+e+" is removed in js-yaml 4. Use yaml."+n+" instead, which is now safe by default.")}}var LS=V,xS=xi,FS=Mi,$S=Hi,PS=qi,MS=At,US=co.load,ZS=co.loadAll,zS=kS.dump,VS=B,HS={binary:Ki,float:Vi,map:Pi,null:Ui,pairs:Ji,set:Xi,timestamp:Bi,bool:Zi,int:zi,merge:Yi,omap:Wi,seq:$i,str:Fi},qS=Rt("safeLoad","load"),GS=Rt("safeLoadAll","loadAll"),jS=Rt("safeDump","dump"),BS={Type:LS,Schema:xS,FAILSAFE_SCHEMA:FS,JSON_SCHEMA:$S,CORE_SCHEMA:PS,DEFAULT_SCHEMA:MS,load:US,loadAll:ZS,dump:zS,YAMLException:VS,types:HS,safeLoad:qS,safeLoadAll:GS,safeDump:jS};function yo(e){var o;let n;try{n=BS.load(e)}catch(s){throw new xn(s instanceof Error?s.message:"Unknown YAML parse error",void 0,void 0,s instanceof Error?s:void 0)}if(n==null)throw new xn("YAML content is empty or null");if(typeof n!="object")throw new xn(`Expected object at root, got ${typeof n}`);const t=n,r=typeof t.id=="number"?t.id:void 0,i=Rf.safeParse(n);if(!i.success){const s=i.error.issues.map(c=>`${c.path.join(".")}: ${c.message}`),a=((o=i.error.issues[0])==null?void 0:o.path.join("."))??"unknown";throw new Nf(`Validation failed with ${i.error.issues.length} issue(s)`,r??0,a,s)}return i.data}function Co(e){const{id:n,data:t}=e;H.register(n,{jaName:t.jaName,type:t.type,frameType:t.frameType,monsterTypeList:t.monsterTypeList,spellType:t.spellType,trapType:t.trapType,edition:t.edition??"latest",race:t.race,level:t.level,attack:t.attack,defense:t.defense})}function YS(e){const{id:n,data:t}=e,r=e.effectChainableActions,i=t.spellType;if(r!=null&&r.activations)if(i==="normal"){const o=a_(n,r.activations);z.registerActivation(n,o)}else if(i==="quick-play"){const o=l_(n,r.activations);z.registerActivation(n,o)}else if(i==="continuous"){const o=f_(n,r.activations);z.registerActivation(n,o)}else if(i==="equip"){const o=g_(n,r.activations);z.registerActivation(n,o)}else throw new Error(`Unsupported spell type "${i}" for card ID ${n}`);else if(i==="continuous"){const o=pt.createNoOp(n);z.registerActivation(n,o)}else if(i==="field"){const o=gi.createNoOp(n);z.registerActivation(n,o)}else if(i==="equip"){const o=ft.createNoOp(n);z.registerActivation(n,o)}r!=null&&r.ignitions&&r.ignitions.forEach((o,s)=>{const a=h_(n,s+1,o);z.registerIgnition(n,a)}),r!=null&&r.triggers&&r.triggers.forEach((o,s)=>{const a=v_(n,s+1,o);z.registerTrigger(n,a)})}function KS(e){const{id:n}=e,t=e.effectAdditionalRules;if(t){if(t.continuous)for(const r of t.continuous){const i=new A_(n,r);Le.register(n,i)}if(t.unclassified){for(const r of t.unclassified)if(r.category==="ActionOverride"){const i=new R_(n,r);Le.register(n,i)}}}}function Ao(e){const n=yo(e);Co(n)}function WS(e){const n=yo(e);Co(n),YS(n),KS(n)}const JS=(e,n,t)=>[n,()=>H.register(n,{jaName:t,type:"trap",frameType:"trap",trapType:e,edition:"latest"})],XS=new Map([JS("normal",83968380,"強欲な瓶")]);function To(e){const n=XS.get(e);n&&n()}function QS(e){H.clear();for(const n of e){const t=Hn.get(n);if(t){Ao(t);continue}To(n)}}const Io=[24874631];function ev(e){H.clear(),z.clear(),Le.clear();for(const n of Io){const t=Hn.get(n);t&&Ao(t)}for(const n of e){const t=Hn.get(n);if(t){WS(t);continue}To(n),Zf(n),C_(n)}}const nv={name:"封印されしエクゾディア",description:"魔法カード主体のエクゾディアデッキです",category:"エクゾディア",mainDeck:[{id:33396948,quantity:1},{id:70903634,quantity:1},{id:7902349,quantity:1},{id:8124921,quantity:1},{id:44519536,quantity:1},{id:55144522,quantity:3},{id:79571449,quantity:3},{id:70368879,quantity:3},{id:33782437,quantity:3},{id:93946239,quantity:3},{id:74519184,quantity:3},{id:90928333,quantity:3},{id:98494543,quantity:3},{id:85852291,quantity:3},{id:73628505,quantity:3},{id:67616300,quantity:3},{id:98645731,quantity:1},{id:59750328,quantity:1}],extraDeck:[]},tv={name:"レガシー・エクゾディア",description:"往年のクリッター・黒き森のウィッチを使えるエクゾディアデッキです",category:"エクゾディア",mainDeck:[{id:33396948,quantity:1},{id:70903634,quantity:1},{id:7902349,quantity:1},{id:8124921,quantity:1},{id:44519536,quantity:1},{id:26202165,quantity:3},{id:78010363,quantity:3},{id:55144522,quantity:3},{id:79571449,quantity:3},{id:70368879,quantity:3},{id:33782437,quantity:3},{id:93946239,quantity:3},{id:67616300,quantity:3},{id:74519184,quantity:3},{id:98494543,quantity:3},{id:90928333,quantity:3},{id:98645731,quantity:1},{id:73628505,quantity:1}],extraDeck:[]},rv={name:"図書館エクゾ",description:"王立魔法図書館に魔力カウンターに置いてドローするエクゾディアデッキです",category:"エクゾディア",mainDeck:[{id:33396948,quantity:1},{id:70903634,quantity:1},{id:7902349,quantity:1},{id:8124921,quantity:1},{id:44519536,quantity:1},{id:70791313,quantity:3},{id:423585,quantity:1},{id:89997728,quantity:3},{id:15259703,quantity:1},{id:73628505,quantity:3},{id:67616300,quantity:3},{id:70368879,quantity:3},{id:33782437,quantity:3},{id:93946239,quantity:3},{id:41587307,quantity:3},{id:74029853,quantity:3},{id:74519184,quantity:3},{id:90928333,quantity:1},{id:85852291,quantity:1},{id:98645731,quantity:1}],extraDeck:[]},iv={name:"パンダエクゾ",description:"トレジャーパンダと通常モンスターを活用してドローするエクゾディアデッキです",category:"エクゾディア",mainDeck:[{id:33396948,quantity:1},{id:70903634,quantity:1},{id:7902349,quantity:1},{id:8124921,quantity:1},{id:44519536,quantity:1},{id:45221020,quantity:3},{id:423585,quantity:3},{id:47643326,quantity:2},{id:70368879,quantity:3},{id:33782437,quantity:3},{id:93946239,quantity:2},{id:67169062,quantity:1},{id:67616300,quantity:3},{id:67775894,quantity:3},{id:18756904,quantity:3},{id:90928333,quantity:3},{id:85852291,quantity:3},{id:22589918,quantity:3}],extraDeck:[{id:50091196,quantity:3},{id:90953320,quantity:1},{id:64880894,quantity:1}]},ov={name:"サイエンカタパ",description:"魔導サイエンティストで特殊召喚した融合モンスターを、カタパルトタートルで射出するデッキです",category:"フルバーン",mainDeck:[{id:34206604,quantity:1},{id:95727991,quantity:3},{id:40737112,quantity:3},{id:79875176,quantity:1},{id:55144522,quantity:1},{id:79571449,quantity:1},{id:83764719,quantity:1},{id:70828912,quantity:1},{id:23557835,quantity:1},{id:85602018,quantity:3},{id:43040603,quantity:3},{id:58577036,quantity:3},{id:74519184,quantity:3},{id:98494543,quantity:3},{id:85852291,quantity:3},{id:22589918,quantity:3},{id:24874630,quantity:3},{id:89997728,quantity:3}],extraDeck:[{id:46696593,quantity:3},{id:86164529,quantity:3},{id:54622031,quantity:3}]},Oo={"exodia-deck":nv,"legacy-exodia-deck":tv,"library-exodia-deck":rv,"panda-exodia-deck":iv,"scientist-catapult-deck":ov};function Dv(e,n=!1){const t=[...e.mainDeck.monsters,...e.mainDeck.spells,...e.mainDeck.traps,...e.extraDeck.fusion,...e.extraDeck.synchro,...e.extraDeck.xyz,...e.extraDeck.link].map(r=>r.cardData.id);return n?[...t,...Io]:t}function bv(){return Object.entries(Oo).map(([e,n])=>({id:e,name:n.name}))}function Ro(e,n,t){const r=new Map;for(const i of n){const o=e.get(i.id);if(!o)continue;const s=t(o);if(!s)continue;const a=r.get(s)??[];a.push({cardData:o,quantity:i.quantity}),r.set(s,a)}return r}function sv(e,n){const t=Ro(e,n,r=>r.type);return{monsters:t.get("monster")??[],spells:t.get("spell")??[],traps:t.get("trap")??[]}}function av(e,n){const t=["fusion","synchro","xyz","link"],r=Ro(e,n,i=>t.includes(i.frameType)?i.frameType:null);return{fusion:r.get("fusion")??[],synchro:r.get("synchro")??[],xyz:r.get("xyz")??[],link:r.get("link")??[]}}function cv(e,n){const t=e.monsters.reduce((p,m)=>p+m.quantity,0),r=e.spells.reduce((p,m)=>p+m.quantity,0),i=e.traps.reduce((p,m)=>p+m.quantity,0),o=t+r+i,s=n.fusion.reduce((p,m)=>p+m.quantity,0),a=n.synchro.reduce((p,m)=>p+m.quantity,0),c=n.xyz.reduce((p,m)=>p+m.quantity,0),u=n.link.reduce((p,m)=>p+m.quantity,0),l=s+a+c+u,d=e.monsters.length+e.spells.length+e.traps.length+n.fusion.length+n.synchro.length+n.xyz.length+n.link.length;return{mainDeckCount:o,monsterCount:t,spellCount:r,trapCount:i,extraDeckCount:l,fusionCount:s,synchroCount:a,xyzCount:c,linkCount:u,uniqueCards:d}}function uv(e){if(typeof e.id!="number"||!Number.isInteger(e.id)||e.id<=0)throw new Error(`Invalid card ID: ${e.id}. RecipeCardEntry must have a valid positive integer ID.`);if(typeof e.quantity!="number"||!Number.isInteger(e.quantity)||e.quantity<=0)throw new Error(`Invalid quantity: ${e.quantity} for card ID ${e.id}. Quantity must be a positive integer.`)}function yr(e){const n=Oo[e];if(!n)throw new Error(`Deck not found: ${e}`);return n}function lv(e){const n=[...e.mainDeck,...e.extraDeck];for(const t of n)uv(t);return Array.from(new Set(n.map(t=>t.id)))}function dv(e,n){const t=n.map(a=>H.get(a)),r=new Map(t.map(a=>[a.id,a])),i=sv(r,e.mainDeck),o=av(r,e.extraDeck),s=cv(i,o);return{name:e.name,description:e.description,category:e.category,mainDeck:i,extraDeck:o,stats:s}}function No(){return _.initialize({mainDeckCardIds:[],extraDeckCardIds:[]},H.getCard,{skipShuffle:!0,skipInitialDraw:!0})}const re=Wn(No());function fv(e){const n=[];e.mainDeck.forEach(r=>{for(let i=0;i<r.quantity;i++)n.push(r.id)});const t=[];return e.extraDeck.forEach(r=>{for(let i=0;i<r.quantity;i++)t.push(r.id)}),{mainDeckCardIds:n,extraDeckCardIds:t}}function pv(e){const n=fv(e);re.set(_.initialize(n,H.getCard))}function mv(e){re.set(e)}function qe(){let e=No();return re.subscribe(t=>{e=t})(),e}function Cr(){return{isBuilding:!1,stack:[],currentChainNumber:0,lastSpellSpeed:null}}function hv(){const{subscribe:e,update:n,set:t}=Wn(Cr()),r={subscribe:e,startChain:()=>{n(i=>({...i,isBuilding:!0,currentChainNumber:1}))},pushChainBlock:i=>{n(o=>{const s={...i,chainNumber:o.currentChainNumber};return{...o,stack:[...o.stack,s],currentChainNumber:o.currentChainNumber+1,lastSpellSpeed:i.spellSpeed}})},endChainBuilding:()=>{n(i=>({...i,isBuilding:!1}))},popChainBlock:()=>{const i=K(r);if(i.stack.length===0)return;const o=i.stack[i.stack.length-1];return n(s=>({...s,stack:s.stack.slice(0,-1)})),o},canChain:i=>{const o=K(r);return o.isBuilding?i>=(o.lastSpellSpeed??1):i>=1},getStackedInstanceIds:()=>{const i=K(r);return new Set(i.stack.map(o=>o.sourceInstanceId))},getRequiredSpellSpeed:()=>{const i=K(r);return i.stack.length===0?1:Math.max(2,i.lastSpellSpeed??2)},reset:()=>{t(Cr())}};return r}const Y=hv();function Fe(e,n,t){const r=e.action(n,t);return r.success?(re.set(r.updatedState),{updatedState:r.updatedState,emittedEvents:r.emittedEvents||[],message:r.message}):(console.error("[executeStepAction] Step action failed:",e.id,r.message),{updatedState:n,emittedEvents:[]})}const _v=async(e,n)=>({shouldContinue:!0,emittedEvents:Fe(e,n).emittedEvents}),gv=async(e,n,t)=>{const r=Fe(e,n);return t.notification&&t.notification.showInfo(e.summary,e.description),{shouldContinue:!0,delay:300,emittedEvents:r.emittedEvents}},Sv=async(e,n,t)=>{const r=Fe(e,n);return t.notification&&r.message&&t.notification.showInfo("",r.message),{shouldContinue:!0,delay:300,emittedEvents:r.emittedEvents}},vv=async(e,n,t,r)=>{const i=f.AtomicStep.resolveCardSelection(e,n);if(!i)return{shouldContinue:!0,emittedEvents:Fe(e,n).emittedEvents};const{config:o,availableCards:s}=i;let a=[];const c=e.sourceCardId?H.getCardNameWithBrackets(e.sourceCardId):void 0;return await new Promise(u=>{r(l=>({...l,cardSelectionConfig:{availableCards:s,sourceCardName:c,minCards:o.minCards,maxCards:o.maxCards,summary:o.summary,description:o.description,cancelable:o.cancelable,canConfirm:o.canConfirm,onConfirm:d=>{const p=K(re);a=Fe(e,p,d).emittedEvents,r(g=>({...g,cardSelectionConfig:null})),u()},onCancel:()=>{r(d=>({...d,cardSelectionConfig:null})),u()}}}))}),{shouldContinue:!0,emittedEvents:a}},Ev=async(e,n,t,r)=>{let i=[];const o=e.sourceCardId?H.getCardNameWithBrackets(e.sourceCardId):void 0;return await new Promise(s=>{r(a=>({...a,confirmationConfig:{sourceCardName:o,summary:e.summary,description:e.description,onConfirm:()=>{const c=K(re);i=Fe(e,c).emittedEvents,r(l=>({...l,confirmationConfig:null})),s()}}}))}),{shouldContinue:!0,emittedEvents:i}};function yv(e){const n=e.notificationLevel||"static";return n==="silent"?_v:n==="static"?gv:n==="dynamic"?Sv:e.cardSelectionConfig?vv:Ev}async function Cv(e,n,t,r,i){const o=[],s=[];for(const u of e){const l=Le.collectTriggerSteps(n,u);o.push(...l.mandatorySteps);for(const p of l.optionalEffects){const m=H.getCardNameWithBrackets(p.instance.id);s.push({sourceCardName:m,activate:()=>p.steps})}const d=z.collectTriggerSteps(n,u);for(const p of d.mandatoryChainBlocks)Y.pushChainBlock(p);o.push(...d.mandatorySteps);for(const p of d.optionalEffects){const m=H.getCardNameWithBrackets(p.instance.id);s.push({sourceCardName:m,activate:()=>(Y.pushChainBlock({sourceInstanceId:p.instance.instanceId,sourceCardId:p.instance.id,effectId:p.action.effectId,spellSpeed:p.action.spellSpeed,resolutionSteps:p.resolutionSteps,isNegated:!1}),p.activationSteps)})}}const a=[];for(const u of s){const l=await new Promise(d=>{i(p=>({...p,optionalTriggerConfirmConfig:{sourceCardName:u.sourceCardName,onActivate:()=>{const m=u.activate();i(g=>({...g,optionalTriggerConfirmConfig:null})),d(m)},onPass:()=>{i(m=>({...m,optionalTriggerConfirmConfig:null})),d([])}}}))});a.push(...l)}const c=[...o,...a];return c.length===0?t:[...t.slice(0,r+1),...c,...t.slice(r+1)]}function Av(){const{subscribe:e,update:n}=Wn({isActive:!1,currentStep:null,steps:[],currentIndex:-1,notificationHandler:null,confirmationConfig:null,cardSelectionConfig:null,chainConfirmationConfig:null,optionalTriggerConfirmConfig:null,eventTimeline:f.TimeLine.createEmptyTimeline()}),t=u=>{n(d=>({...d,isActive:!0,steps:u,currentIndex:0,currentStep:u[0]||null})),u[0]&&r()},r=async()=>{let u=K(c);if(!u.currentStep)return;if(wh(u.currentStep)){n(g=>({...g,eventTimeline:f.TimeLine.advanceTime(g.eventTimeline)})),i(u,n)&&r();return}const l=K(re),p=await yv(u.currentStep)(u.currentStep,l,{notification:u.notificationHandler},n);if(p.emittedEvents&&p.emittedEvents.length>0){let m=u.eventTimeline;for(const y of p.emittedEvents)m=f.TimeLine.recordEvent(m,y);const g=K(re),v=await Cv(p.emittedEvents,g,u.steps,u.currentIndex,n);n(y=>({...y,steps:v,eventTimeline:m})),u=K(c)}p.delay&&await new Promise(m=>setTimeout(m,p.delay)),p.shouldContinue&&i(u,n)&&r()};function i(u,l){const d=u.currentIndex+1;return d<u.steps.length?(l(p=>({...p,currentIndex:d,currentStep:p.steps[d]})),!0):(o(l),!1)}function o(u){u(d=>({...d,isActive:!1,currentStep:null,steps:[],currentIndex:-1}));const l=K(Y);if(l.stack.length>0)if(l.isBuilding){const d=K(re),p=Y.getRequiredSpellSpeed(),m=Y.getStackedInstanceIds(),g=z.collectChainableActions(d,p,m);if(g.length>0){u(v=>({...v,chainConfirmationConfig:{chainableCards:g,onActivate:y=>{const N=g.find(A=>A.instance.instanceId===y);N&&c.activateChain(N.instance,N.action)},onPass:()=>{u(y=>({...y,chainConfirmationConfig:null})),s()}}}));return}setTimeout(()=>{s()},0)}else setTimeout(()=>{a()},0);else Y.reset()}const s=()=>{Y.endChainBuilding(),a()};function a(){const u=Y.popChainBlock();if(!u){Y.reset();return}!u.isNegated&&u.resolutionSteps.length>0?(n(l=>({...l,isActive:!0,steps:u.resolutionSteps,currentIndex:0,currentStep:u.resolutionSteps[0]||null})),r()):a()}const c={subscribe:e,registerNotificationHandler:u=>{n(l=>({...l,notificationHandler:u}))},handleEffectQueues:(u,l)=>{u&&(K(Y).stack.length===0&&Y.startChain(),Y.pushChainBlock(u)),l&&l.length>0?t(l):u&&s()},activateChain:(u,l)=>{if(!Y.canChain(l.spellSpeed)){console.warn("Invalid chain attempt: Spell speed too low.");return}n(v=>({...v,chainConfirmationConfig:null}));const d=K(re),p={...d,space:_i(d.space,u),activatedCardIds:_.updatedActivatedCardIds(d.activatedCardIds,u.id)};re.set(p);const m=l.createActivationSteps(p,u),g=l.createResolutionSteps(p,u);Y.pushChainBlock({sourceInstanceId:u.instanceId,sourceCardId:u.id,effectId:l.effectId,spellSpeed:l.spellSpeed,resolutionSteps:g,isNegated:!1}),m.length>0?t(m):o(n)}};return c}const Tv=Av();class Iv{constructor(){C(this,"snapshotRepository",null)}canExecuteCommand(n,...t){const r=qe();return new n(...t).canExecute(r).isValid}executeCommand(n,...t){const r=qe(),o=new n(...t).execute(r);return o.success&&this.applyCommandResult(o),o}applyCommandResult(n){re.set(n.updatedState),Tv.handleEffectQueues(n.chainBlock,n.activationSteps)}setupDeck(n,t=!1){const r=yr(n),i=lv(r);return t?QS(i):ev(i),dv(r,i)}setSnapshotRepository(n){this.snapshotRepository=n}saveGame(n){this.snapshotRepository&&this.snapshotRepository.save(n,qe())}restoreGame(){if(!this.snapshotRepository)return;const n=this.snapshotRepository.load();n&&mv(n.snapshot)}getSavedDeckId(){var n,t;return((t=(n=this.snapshotRepository)==null?void 0:n.load())==null?void 0:t.deckId)??null}clearSavedGame(){var n;(n=this.snapshotRepository)==null||n.clear()}newGame(n){const t=this.setupDeck(n);return this.resetGame(yr(n)),t}resetGame(n){pv(n)}getGameState(){return qe()}advancePhase(){return this.executeCommand(Ea)}async autoAdvanceToMainPhase(n,t){const r=qe();if(r.turn!==1||r.phase!=="draw")return!1;for(let i=0;i<2;i++){n&&await n();const o=this.advancePhase();if(o.success)o.message&&t&&t(o.message);else return console.error(`[GameFacade] Auto advance failed: ${o.error}`),!1}return!0}canSummonMonster(n){return this.canExecuteCommand(un,n,"summon")}summonMonster(n){return this.executeCommand(un,n,"summon")}canSetMonster(n){return this.canExecuteCommand(un,n,"set")}setMonster(n){return this.executeCommand(un,n,"set")}canSetSpellTrap(n){return this.canExecuteCommand(tr,n)}setSpellTrap(n){return this.executeCommand(tr,n)}canActivateSpell(n){return this.canExecuteCommand(rr,n)}activateSpell(n){return this.executeCommand(rr,n)}canActivateIgnitionEffect(n){return this.canExecuteCommand(ir,n)}activateIgnitionEffect(n){return this.executeCommand(ir,n)}canSynchroSummon(n){return this.canExecuteCommand(or,n)}synchroSummon(n){return this.executeCommand(or,n)}}const wv=new Iv;export{H as C,Nv as Z,wv as a,ie as b,re as c,Ls as d,Dv as e,Tv as f,bv as g,nn as h,dn as n,ae as o,ln as s};
