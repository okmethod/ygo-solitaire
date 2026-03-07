var bt=Object.defineProperty;var Vt=(s,e,t)=>e in s?bt(s,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):s[e]=t;var d=(s,e,t)=>Vt(s,typeof e!="symbol"?e+"":e,t);import{j as Pt,C as Lt,E as ye,G as r,n as Ee,b as f,c as l,s as He,d as W,e as ie,f as F,i as kt,h as De,k as be,l as Ve,o as z,m as p,p as te,q as ne,r as xt}from"./B_oeF2jN.js";import{w as oe,g as m}from"./CebzHo8n.js";import{c as wt,a as y,f as _}from"./C2j_5X9e.js";import{l as Be,F as Mt,t as se,aq as Pe,m as he,n as Ze,w as S,ar as x,z as A,B as N,y as J,x as j,ay as Ft}from"./8IcbDFZa.js";import{s as re}from"./CjT8C9BD.js";import{i as M}from"./_4Sr1Rl8.js";import{a as Le,b as Y,s as Gt}from"./C076Ff9n.js";import{p as D}from"./BzOwF7ft.js";import{b as Ut,c as jt}from"./wNxHg8Hs.js";const Ht=`# 《強欲な壺》 (Pot of Greed)
# Card ID: 55144522 | Type: Spell | Subtype: Normal
#
# カードの発動:
# - CONDITIONS: デッキに2枚以上
# - ACTIVATION: 無し
# - RESOLUTION: 2枚ドロー

id: 55144522
data:
  jaName: "強欲な壺"
  type: "spell"
  frameType: "spell"
  spellType: "normal"

effect-chainable-actions:
  activations:
    conditions:
      - step: "CAN_DRAW"
        args: { count: 2 }
    resolutions:
      - step: "DRAW"
        args: { count: 2 }
`,Bt=`# 《成金ゴブリン》 (Upstart Goblin)
# Card ID: 70368879 | Type: Spell | Subtype: Normal
#
# カードの発動:
# - CONDITIONS: デッキに1枚以上
# - ACTIVATION: 無し
# - RESOLUTION: 1枚ドロー、相手が1000LP回復

id: 70368879
data:
  jaName: "成金ゴブリン"
  type: "spell"
  frameType: "spell"
  spellType: "normal"

effect-chainable-actions:
  activations:
    conditions:
      - step: "CAN_DRAW"
        args: { count: 1 }
    resolutions:
      - step: "DRAW"
        args: { count: 1 }
      - step: "GAIN_LP"
        args: { amount: 1000, target: "opponent" }
`,Zt=`# 《天使の施し》 (Graceful Charity)
# Card ID: 79571449 | Type: Spell | Subtype: Normal
#
# カードの発動:
# - CONDITIONS: デッキに3枚以上
# - ACTIVATION: 無し
# - RESOLUTION: 3枚ドロー、手札を2枚捨てる

id: 79571449
data:
  jaName: "天使の施し"
  type: "spell"
  frameType: "spell"
  spellType: "normal"

effect-chainable-actions:
  activations:
    conditions:
      - step: "CAN_DRAW"
        args: { count: 3 }
    resolutions:
      - step: "DRAW"
        args: { count: 3 }
      - step: "THEN"
      - step: "SELECT_AND_DISCARD"
        args: { count: 2 }
`,Yt=`# 《テラ・フォーミング》 (Terraforming)
# Card ID: 73628505 | Type: Spell | Subtype: Normal
#
# カードの発動:
# - CONDITIONS: デッキにフィールド魔法が1枚以上
# - ACTIVATION: 無し
# - RESOLUTION: フィールド魔法1枚をサーチ

id: 73628505
data:
  jaName: "テラ・フォーミング"
  type: "spell"
  frameType: "spell"
  spellType: "normal"

effect-chainable-actions:
  activations:
    conditions:
      - step: "DECK_HAS_CARD"
        args: { filterType: "spell", filterSpellType: "field", minCount: 1 }
    resolutions:
      - step: "SEARCH_FROM_DECK"
        args: { filterType: "spell", filterSpellType: "field", count: 1 }
`,Wt=`# 《魔法石の採掘》 (Magical Stone Excavation)
# Card ID: 98494543 | Type: Spell | Subtype: Normal
#
# カードの発動:
# - CONDITIONS: 捨てられる手札が2枚以上、墓地に魔法カードが1枚以上
# - ACTIVATION: 手札を2枚捨てる
# - RESOLUTION: 魔法カード1枚をサルベージ

id: 98494543
data:
  jaName: "魔法石の採掘"
  type: "spell"
  frameType: "spell"
  spellType: "normal"

effect-chainable-actions:
  activations:
    conditions:
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
`,zt=`# 《無の煉獄》 (Into the Void)
# Card ID: 93946239 | Type: Spell | Subtype: Normal
#
# カードの発動:
# - CONDITIONS: 手札が3枚以上、デッキに1枚以上
# - ACTIVATION: 無し
# - RESOLUTION: 1枚ドロー、エンドフェイズに手札を全て捨てる

id: 93946239

data:
  jaName: "無の煉獄"
  type: "spell"
  frameType: "spell"
  spellType: "normal"

effect-chainable-actions:
  activations:
    conditions:
      - step: "HAND_COUNT"
        args: { minCount: 3 }
      - step: "CAN_DRAW"
        args: { count: 1 }
    resolutions:
      - step: "DRAW"
        args: { count: 1 }
      - step: "DISCARD_ALL_HAND_END_PHASE"
`,qt=`# 《命削りの宝札》 (Card of Demise)
# Card ID: 59750328 | Type: Spell | Subtype: Normal
#
# カードの発動:
# - CONDITIONS: 1ターンに1度制限
# - ACTIVATION: 無し
# - RESOLUTION: 手札が3枚になるようにドロー、エンドフェイズに手札を全て捨てる

id: 59750328

data:
  jaName: "命削りの宝札"
  type: "spell"
  frameType: "spell"
  spellType: "normal"

effect-chainable-actions:
  activations:
    conditions:
      - step: "ONCE_PER_TURN"
    resolutions:
      - step: "FILL_HANDS"
        args: { count: 3 }
      - step: "DISCARD_ALL_HAND_END_PHASE"
`,Kt=`# 《闇の量産工場》 (Dark Factory of Mass Production)
# Card ID: 90928333 | Type: Spell | Subtype: Normal
#
# カードの発動:
# - CONDITIONS: 1ターンに1度制限
# - ACTIVATION: 無し
# - RESOLUTION: 手札が3枚になるようにドロー、エンドフェイズに手札を全て捨てる

id: 90928333

data:
  jaName: "闇の量産工場"
  type: "spell"
  frameType: "spell"
  spellType: "normal"

effect-chainable-actions:
  activations:
    conditions:
      - step: "GRAVEYARD_HAS_MONSTER"
        args: { minCount: 2, frameType: "normal" }
    resolutions:
      - step: "SALVAGE_FROM_GRAVEYARD"
        args: { filterType: "monster", filterFrameType: "normal", count: 2 }
`,Qt=`# 《一時休戦》 (One Day of Peace)
# Card ID: 33782437 | Type: Spell | Subtype: Normal
#
# カードの発動:
# - CONDITIONS: デッキに1枚以上
# - ACTIVATION: 無し
# - RESOLUTION: 1枚ドロー
#
# Note: 相手のドロー処理・ダメージ無効化フラグは未実装

id: 33782437
data:
  jaName: "一時休戦"
  type: "spell"
  frameType: "spell"
  spellType: "normal"

effect-chainable-actions:
  activations:
    conditions:
      - step: "CAN_DRAW"
        args: { count: 1 }
    resolutions:
      - step: "DRAW"
        args: { count: 1 }
      # TODO: ダメージ無効化フラグ設定
      # TODO: 相手のドロー処理
`,Xt=`# 《トゥーンのもくじ》 (Toon Table of Contents)
# Card ID: 89997728 | Type: Spell | Subtype: Normal
#
# カードの発動:
# - CONDITIONS: デッキに「トゥーン」カードが1枚以上
# - ACTIVATION: 無し
# - RESOLUTION: 「トゥーン」カード1枚をサーチ

id: 89997728
data:
  jaName: "トゥーンのもくじ"
  type: "spell"
  frameType: "spell"
  spellType: "normal"

effect-chainable-actions:
  activations:
    conditions:
      - step: "DECK_HAS_NAME_INCLUDES"
        args: { namePattern: "トゥーン", minCount: 1 }
    resolutions:
      - step: "SEARCH_FROM_DECK_BY_NAME"
        args: { namePattern: "トゥーン", count: 1 }
`,Jt=`# 《強欲で謙虚な壺》 (Pot of Duality)
# Card ID: 98645731 | Type: Spell | Subtype: Normal
#
# カードの発動:
# - CONDITIONS: 1ターンに1度制限、デッキに3枚以上
# - ACTIVATION: 無し
# - RESOLUTION: デッキトップ3枚確認、1枚選んで手札に加える、デッキシャッフル

id: 98645731
data:
  jaName: "強欲で謙虚な壺"
  type: "spell"
  frameType: "spell"
  spellType: "normal"

effect-chainable-actions:
  activations:
    conditions:
      - step: "ONCE_PER_TURN"
      - step: "CAN_DRAW"
        args: { count: 3 }
    resolutions:
      - step: "SEARCH_FROM_DECK_TOP"
        args: { count: 3, selectCount: 1 }
      - step: "SHUFFLE_DECK"
`,$t=`# 《打ち出の小槌》 (Magical Mallet)
# Card ID: 85852291 | Type: Spell | Subtype: Normal
#
# カードの発動:
# - CONDITIONS: 無し
# - ACTIVATION: 無し
# - RESOLUTION: 手札から任意枚数選択、デッキに戻してシャッフル、同じ枚数ドロー

id: 85852291
data:
  jaName: "打ち出の小槌"
  type: "spell"
  frameType: "spell"
  spellType: "normal"

effect-chainable-actions:
  activations:
    resolutions:
      - step: "SELECT_RETURN_SHUFFLE_DRAW"
        args: { min: 0 }
`,en=`# 《手札断殺》 (Card Destruction)
# Card ID: 74519184 | Type: Spell | Subtype: Quick-Play
#
# カードの発動:
# - CONDITIONS: 捨てられる手札が2枚以上、デッキに2枚以上
# - ACTIVATION: 無し
# - RESOLUTION: 手札を2枚捨てる、2枚ドロー
#
# Note: 相手の捨てる処理・ドロー処理は未実装

id: 74519184
data:
  jaName: "手札断殺"
  type: "spell"
  frameType: "spell"
  spellType: "quick-play"

effect-chainable-actions:
  activations:
    conditions:
      - step: "HAND_COUNT_EXCLUDING_SELF"
        args: { minCount: 2 }
      - step: "CAN_DRAW"
        args: { count: 2 }
    resolutions:
      - step: "SELECT_AND_DISCARD"
        args: { count: 2 }
      - step: "DRAW"
        args: { count: 2 }
`,tn=`# 《トゥーン・ワールド》 (Toon World)
# Card ID: 15259703 | Type: Spell | Subtype: Continuous
#
# カードの発動:
# - CONDITIONS: LP>=1000
# - ACTIVATION: 1000LP支払い
# - RESOLUTION: 無し（フィールドに残る）

id: 15259703
data:
  jaName: "トゥーン・ワールド"
  type: "spell"
  frameType: "spell"
  spellType: "continuous"

effect-chainable-actions:
  activations:
    conditions:
      - step: "LP_AT_LEAST"
        args: { amount: 1000 }
    activations:
      - step: "PAY_LP"
        args: { amount: 1000 }
`,nn=`# 《チキンレース》 (Chicken Game)
# Card ID: 67616300 | Type: Spell | Subtype: Field
#
# 起動効果:
# - CONDITIONS: LP>1000、1ターンに1度制限
# - ACTIVATION: 1000LP支払い
# - RESOLUTION: 1枚ドロー
#
# Note: 本来は3つの選択肢から1つを選択するが、実装簡略化のためドロー効果のみ実装

id: 67616300
data:
  jaName: "チキンレース"
  type: "spell"
  frameType: "spell"
  spellType: "field"

effect-chainable-actions:
  ignitions:
    - conditions:
        - step: "LP_GREATER_THAN"
          args: { amount: 1000 }
        - step: "ONCE_PER_TURN_EFFECT"
          args: { effectIndex: 1 }
      activations:
        - step: "PAY_LP"
          args: { amount: 1000 }
      resolutions:
        - step: "DRAW"
          args: { count: 1 }
`,an=`# 《王立魔法図書館》 (Royal Magical Library)
# Card ID: 70791313 | Type: Monster | Subtype: Effect
#
# 永続効果:
# - 魔法カードが発動する度に、このカードに魔力カウンターを1つ置く（最大3つまで）
#
# 起動効果:
# - CONDITIONS: 魔力カウンターが3つ以上
# - ACTIVATION: 魔力カウンターを3つ取り除く
# - RESOLUTION: 1枚ドロー

id: 70791313
data:
  jaName: "王立魔法図書館"
  type: "monster"
  frameType: "effect"
  attribute: "LIGHT"
  race: "Spellcaster"
  level: 4

effect-additional-rules:
  continuous:
    - category: "TriggerRule"
      triggers: ["spellActivated"]
      triggerTiming: "if"
      isMandatory: true
      resolutions:
        - step: "PLACE_COUNTER"
          args: { counterType: "spell", count: 1, limit: 3 }

effect-chainable-actions:
  ignitions:
    - conditions:
        - step: "HAS_COUNTER"
          args: { counterType: "spell", minCount: 3 }
      activations:
        - step: "REMOVE_COUNTER"
          args: { counterType: "spell", count: 3 }
      resolutions:
        - step: "DRAW"
          args: { count: 1 }
`,sn=`# 《召喚僧サモンプリースト》 (Summoner Monk)
# Card ID: 423585 | Type: Monster | Subtype: Effect
#
# 永続効果:
# - このカードはリリースできない（未実装）
#
# 誘発効果:
# - CONDITIONS: このカードが召喚に成功した場合
# - ACTIVATION: 無し
# - RESOLUTION: このカードを守備表示にする
#
# 起動効果:
# - CONDITIONS: 1ターンに1度制限、捨てられる魔法カードが1枚以上
# - ACTIVATION: 手札から魔法カード1枚を捨てる
# - RESOLUTION: デッキからレベル4モンスター1体を特殊召喚
#
# Note: 反転召喚時の誘発効果、特殊召喚したモンスターがこのターン攻撃できない制約は未実装

id: 423585
data:
  jaName: "召喚僧サモンプリースト"
  type: "monster"
  frameType: "effect"
  attribute: "DARK"
  race: "Spellcaster"
  level: 4

effect-chainable-actions:
  triggers:
    # 誘発効果: 召喚成功時、守備表示にする
    - triggers: ["monsterSummoned"]
      triggerTiming: "if"
      isMandatory: true
      selfOnly: true
      spellSpeed: 1
      conditions: []
      activations: []
      resolutions:
        - step: "CHANGE_BATTLE_POSITION"
          args: { position: "defense" }
  ignitions:
    # 起動効果: 手札魔法1枚捨て → デッキからLv4モンスター特殊召喚
    - conditions:
        - step: "ONCE_PER_TURN"
        - step: "HAND_HAS_SPELL"
          args: { minCount: 1 }
      activations:
        - step: "SELECT_AND_DISCARD"
          args: { count: 1, filterType: "spell" }
      resolutions:
        - step: "SPECIAL_SUMMON_FROM_DECK"
          args: { filterType: "monster", filterLevel: 4, count: 1 }
`,Ye=new Map([[55144522,Ht],[70368879,Bt],[79571449,Zt],[73628505,Yt],[98494543,Wt],[93946239,zt],[59750328,qt],[90928333,Kt],[33782437,Qt],[89997728,Xt],[98645731,Jt],[85852291,$t],[74519184,en],[15259703,tn],[67616300,nn],[70791313,an],[423585,sn]]);class Ce extends Error{constructor(e,t,n,i){const a=t?` (Card ID: ${t})`:"",o=n?` [Field: ${n}]`:"";super(`DSL Parse Error${a}${o}: ${e}`),this.cardId=t,this.field=n,this.cause=i,this.name="DSLParseError"}}class rn extends Error{constructor(e,t,n,i){super(`DSL Validation Error (Card ID: ${t}, Field: ${n}): ${e}`),this.cardId=t,this.field=n,this.issues=i,this.name="DSLValidationError"}}function We(s){var a;let e;try{e=Pt.load(s)}catch(o){throw new Ce(o instanceof Error?o.message:"Unknown YAML parse error",void 0,void 0,o instanceof Error?o:void 0)}if(e==null)throw new Ce("YAML content is empty or null");if(typeof e!="object")throw new Ce(`Expected object at root, got ${typeof e}`);const t=e,n=typeof t.id=="number"?t.id:void 0,i=Lt.safeParse(e);if(!i.success){const o=i.error.issues.map(u=>`${u.path.join(".")}: ${u.message}`),c=((a=i.error.issues[0])==null?void 0:a.path.join("."))??"unknown";throw new rn(`Validation failed with ${i.error.issues.length} issue(s)`,n??0,c,o)}return i.data}class on{constructor(e,t,n=1){d(this,"cardId");d(this,"effectId");d(this,"effectCategory","trigger");d(this,"spellSpeed");this.cardId=e,this.spellSpeed=n,this.effectId=ye.Id.create("trigger",e,t)}canActivate(e,t){const n=this.individualConditions(e,t);return n.isValid?r.Validation.success():n}createActivationSteps(e,t){return[Ee(t.id),...this.individualActivationSteps(e,t)]}createResolutionSteps(e,t){return[...this.individualResolutionSteps(e,t)]}}function cn(s){return s.effectCategory==="trigger"}class E{static registerActivation(e,t){const n=this.getOrCreateEntry(e);n.activation=t}static registerIgnition(e,t){this.getOrCreateEntry(e).ignitionEffects.push(t)}static registerTrigger(e,t){this.getOrCreateEntry(e).triggerEffects.push(t)}static getActivation(e){var t;return(t=this.effects.get(e))==null?void 0:t.activation}static getIgnitionEffects(e){var t;return((t=this.effects.get(e))==null?void 0:t.ignitionEffects)??[]}static hasIgnitionEffects(e){const t=this.effects.get(e);return t!==void 0&&t.ignitionEffects.length>0}static getTriggerEffects(e){var t;return((t=this.effects.get(e))==null?void 0:t.triggerEffects)??[]}static hasTriggerEffects(e){const t=this.effects.get(e);return t!==void 0&&t.triggerEffects.length>0}static collectTriggerSteps(e,t,n){const i=[],a=(o,c)=>{for(const u of o){if(c&&!f.Instance.isFaceUp(u))continue;const g=this.getTriggerEffects(u.id);for(const h of g){if(!cn(h)||!h.triggers.includes(t.type)||h.selfOnly&&t.sourceInstanceId!==u.instanceId||!h.canActivate(e,u).isValid||!h.isMandatory)continue;const ue=h.createActivationSteps(e,u),q=h.createResolutionSteps(e,u);n({sourceInstanceId:u.instanceId,sourceCardId:u.id,effectId:h.effectId,spellSpeed:h.spellSpeed,resolutionSteps:q,isNegated:!1}),i.push(...ue)}}};return a(e.space.hand,!1),a(e.space.mainMonsterZone,!0),a(e.space.spellTrapZone,!0),a(e.space.fieldZone,!0),a(e.space.graveyard,!1),a(e.space.banished,!1),i}static collectChainableActions(e,t,n=new Set){const i=[];for(const a of e.space.hand)n.has(a.instanceId)||(this.collectActivation(i,a,e,t),this.collectEffects(i,a,e,t));for(const a of e.space.mainMonsterZone)n.has(a.instanceId)||f.Instance.isFaceUp(a)&&this.collectEffects(i,a,e,t);for(const a of e.space.spellTrapZone)n.has(a.instanceId)||(f.Instance.isFaceDown(a)?this.collectActivation(i,a,e,t):this.collectEffects(i,a,e,t));for(const a of e.space.fieldZone)n.has(a.instanceId)||f.Instance.isFaceUp(a)&&this.collectEffects(i,a,e,t);for(const a of e.space.graveyard)n.has(a.instanceId)||this.collectEffects(i,a,e,t);for(const a of e.space.banished)n.has(a.instanceId)||this.collectEffects(i,a,e,t);return i}static collectActivation(e,t,n,i){const a=this.getActivation(t.id);a&&this.tryAddAction(e,t,a,n,i)}static collectEffects(e,t,n,i){for(const a of this.getIgnitionEffects(t.id))this.tryAddAction(e,t,a,n,i);for(const a of this.getTriggerEffects(t.id))this.tryAddAction(e,t,a,n,i)}static tryAddAction(e,t,n,i,a){if(n.spellSpeed<a)return;n.canActivate(i,t).isValid&&e.push({instance:t,action:n})}static clear(){this.effects.clear()}static getRegisteredCardIds(){return Array.from(this.effects.keys())}static getOrCreateEntry(e){let t=this.effects.get(e);return t||(t={ignitionEffects:[],triggerEffects:[]},this.effects.set(e,t)),t}}d(E,"effects",new Map);class ce{static register(e,t){const n=this.rules.get(e)||[];this.rules.set(e,[...n,t])}static get(e){return this.rules.get(e)||[]}static getByCategory(e,t){return this.get(e).filter(i=>i.category===t)}static collectActiveRules(e,t){const n=[],i=[...e.space.spellTrapZone,...e.space.fieldZone];for(const a of i){if(!f.Instance.isFaceUp(a))continue;const o=this.getByCategory(a.id,t);for(const c of o)c.canApply(e)&&n.push(c)}return n}static collectTriggerRules(e,t){var a;const n=[],i=[...e.space.mainMonsterZone,...e.space.spellTrapZone,...e.space.fieldZone];for(const o of i){if(!f.Instance.isFaceUp(o))continue;const c=this.getByCategory(o.id,"TriggerRule");for(const u of c)(a=u.triggers)!=null&&a.includes(t)&&n.push({rule:u,sourceInstance:o})}return n}static collectTriggerSteps(e,t){const n=this.collectTriggerRules(e,t.type),i=[];for(const{rule:a,sourceInstance:o}of n){if(!a.canApply(e)||!a.createTriggerSteps||a.selfOnly&&t.sourceInstanceId!==o.instanceId)continue;const c=a.createTriggerSteps(e,o);i.push(...c)}return i}static clear(){this.rules.clear()}static getRegisteredCardIds(){return Array.from(this.rules.keys())}}d(ce,"rules",new Map);function ln(s){return{id:`emit-spell-activated-${s.instanceId}`,summary:"魔法発動イベント",description:"魔法カード発動をトリガーシステムに通知",notificationLevel:"silent",action:e=>r.Result.success(e,void 0,[{type:"spellActivated",sourceCardId:s.id,sourceInstanceId:s.instanceId}])}}function dn(s){return{id:`emit-monster-summoned-${s.instanceId}`,summary:"モンスター召喚イベント",description:"モンスター召喚をトリガーシステムに通知",notificationLevel:"silent",action:e=>r.Result.success(e,void 0,[{type:"monsterSummoned",sourceCardId:s.id,sourceInstanceId:s.instanceId}])}}class le{constructor(e){d(this,"cardId");d(this,"effectId");d(this,"effectCategory","activation");this.cardId=e,this.effectId=ye.Id.create("activation",e)}canActivate(e,t){const n=this.subTypeConditions(e,t);if(!n.isValid)return n;const i=this.individualConditions(e,t);return i.isValid?r.Validation.success():i}createActivationSteps(e,t){return[Ee(this.cardId),ln(t),...this.subTypePreActivationSteps(e,t),...this.individualActivationSteps(e,t),...this.subTypePostActivationSteps(e,t)]}createResolutionSteps(e,t){return[...this.subTypePreResolutionSteps(e,t),...this.individualResolutionSteps(e,t),...this.subTypePostResolutionSteps(e,t)]}}class ze extends le{constructor(){super(...arguments);d(this,"spellSpeed",1)}subTypeConditions(t,n){return l.Phase.isMain(t.phase)?r.Validation.success():r.Validation.failure(r.Validation.ERROR_CODES.NOT_MAIN_PHASE)}subTypePreActivationSteps(t,n){return[]}subTypePostActivationSteps(t){return[]}subTypePreResolutionSteps(t,n){return[]}subTypePostResolutionSteps(t,n){return[He(n.instanceId,n.jaName)]}static createNoOp(t){return new un(t)}}class un extends ze{constructor(e){super(e)}individualConditions(){return r.Validation.success()}individualActivationSteps(){return[]}individualResolutionSteps(){return[]}}class fn extends ze{constructor(t,n){super(t);d(this,"dslDefinition");this.dslDefinition=n}buildSteps(t,n){if(!t||t.length===0)return[];const i={cardId:this.cardId,sourceInstanceId:n.instanceId};return t.map(a=>W(a.step,a.args??{},i))}individualConditions(t,n){const i=this.dslDefinition.conditions;if(!i||i.length===0)return r.Validation.success();for(const a of i){const o=ie(a.step,t,n,a.args??{});if(!o.isValid)return o}return r.Validation.success()}individualActivationSteps(t,n){return this.buildSteps(this.dslDefinition.activations,n)}individualResolutionSteps(t,n){return this.buildSteps(this.dslDefinition.resolutions,n)}}function pn(s,e){return new fn(s,e)}class qe extends le{constructor(){super(...arguments);d(this,"spellSpeed",2)}subTypeConditions(t,n){var i;return f.Instance.isFaceDown(n)&&((i=n.stateOnField)!=null&&i.placedThisTurn)?r.Validation.failure(r.Validation.ERROR_CODES.QUICK_PLAY_RESTRICTION):r.Validation.success()}subTypePreActivationSteps(t,n){return[]}subTypePostActivationSteps(t,n){return[]}subTypePreResolutionSteps(t,n){return[]}subTypePostResolutionSteps(t,n){return[He(n.instanceId,n.jaName)]}static createNoOp(t){return new mn(t)}}class mn extends qe{constructor(e){super(e)}individualConditions(){return r.Validation.success()}individualActivationSteps(){return[]}individualResolutionSteps(){return[]}}class gn extends qe{constructor(t,n){super(t);d(this,"dslDefinition");this.dslDefinition=n}buildSteps(t,n){if(!t||t.length===0)return[];const i={cardId:this.cardId,sourceInstanceId:n.instanceId};return t.map(a=>W(a.step,a.args??{},i))}individualConditions(t,n){const i=this.dslDefinition.conditions;if(!i||i.length===0)return r.Validation.success();for(const a of i){const o=ie(a.step,t,n,a.args??{});if(!o.isValid)return o}return r.Validation.success()}individualActivationSteps(t,n){return this.buildSteps(this.dslDefinition.activations,n)}individualResolutionSteps(t,n){return this.buildSteps(this.dslDefinition.resolutions,n)}}function Sn(s,e){return new gn(s,e)}class Ke extends le{constructor(){super(...arguments);d(this,"spellSpeed",1)}subTypeConditions(t,n){return l.Phase.isMain(t.phase)?r.Validation.success():r.Validation.failure(r.Validation.ERROR_CODES.NOT_MAIN_PHASE)}subTypePreActivationSteps(t,n){return[]}subTypePostActivationSteps(t,n){return[]}subTypePreResolutionSteps(t,n){return[]}subTypePostResolutionSteps(t,n){return[]}static createNoOp(t){return new hn(t)}}class hn extends Ke{constructor(e){super(e)}individualConditions(){return r.Validation.success()}individualActivationSteps(){return[]}individualResolutionSteps(){return[]}}class Cn extends Ke{constructor(t,n){super(t);d(this,"dslDefinition");this.dslDefinition=n}buildSteps(t,n){if(!t||t.length===0)return[];const i={cardId:this.cardId,sourceInstanceId:n.instanceId};return t.map(a=>W(a.step,a.args??{},i))}individualConditions(t,n){const i=this.dslDefinition.conditions;if(!i||i.length===0)return r.Validation.success();for(const a of i){const o=ie(a.step,t,n,a.args??{});if(!o.isValid)return o}return r.Validation.success()}individualActivationSteps(t,n){return this.buildSteps(this.dslDefinition.activations,n)}individualResolutionSteps(t,n){return this.buildSteps(this.dslDefinition.resolutions,n)}}function vn(s,e){return new Cn(s,e)}class In{constructor(e,t){d(this,"cardId");d(this,"effectId");d(this,"effectCategory","ignition");d(this,"spellSpeed",1);this.cardId=e,this.effectId=ye.Id.create("ignition",e,t)}canActivate(e,t){if(!l.Phase.isMain(e.phase))return r.Validation.failure(r.Validation.ERROR_CODES.NOT_MAIN_PHASE);const n=this.individualConditions(e,t);return n.isValid?r.Validation.success():n}createActivationSteps(e,t){return[Ee(t.id),...this.individualActivationSteps(e,t)]}createResolutionSteps(e,t){return[...this.individualResolutionSteps(e,t)]}}class yn extends In{constructor(t,n,i){super(t,n);d(this,"dslDefinition");this.dslDefinition=i}buildSteps(t,n){if(!t||t.length===0)return[];const i={cardId:this.cardId,sourceInstanceId:n.instanceId};return t.map(a=>W(a.step,a.args??{},i))}individualConditions(t,n){const i=this.dslDefinition.conditions;if(!i||i.length===0)return r.Validation.success();for(const a of i){const o=ie(a.step,t,n,a.args??{});if(!o.isValid)return o}return r.Validation.success()}individualActivationSteps(t,n){return this.buildSteps(this.dslDefinition.activations,n)}individualResolutionSteps(t,n){return this.buildSteps(this.dslDefinition.resolutions,n)}}function En(s,e,t){return new yn(s,e,t)}class Tn extends on{constructor(t,n,i){super(t,n,i.spellSpeed??1);d(this,"triggers");d(this,"triggerTiming");d(this,"isMandatory");d(this,"selfOnly");d(this,"dslDefinition");this.dslDefinition=i,this.triggers=i.triggers,this.triggerTiming=i.triggerTiming??"if",this.isMandatory=i.isMandatory??!0,this.selfOnly=i.selfOnly??!1}buildSteps(t,n){if(!t||t.length===0)return[];const i={cardId:this.cardId,sourceInstanceId:n.instanceId};return t.map(a=>W(a.step,a.args??{},i))}individualConditions(t,n){const i=this.dslDefinition.conditions;if(!i||i.length===0)return r.Validation.success();for(const a of i){const o=ie(a.step,t,n,a.args??{});if(!o.isValid)return o}return r.Validation.success()}individualActivationSteps(t,n){return this.buildSteps(this.dslDefinition.activations,n)}individualResolutionSteps(t,n){return this.buildSteps(this.dslDefinition.resolutions,n)}}function _n(s,e,t){return new Tn(s,e,t)}class Rn{constructor(e){d(this,"cardId");d(this,"isEffect",!0);this.cardId=e}canApply(e){return this.isOnFieldFaceUp(e)?this.individualConditions(e):!1}isOnFieldFaceUp(e){return[...e.space.mainMonsterZone,...e.space.spellTrapZone,...e.space.fieldZone].some(n=>n.id===this.cardId&&f.Instance.isFaceUp(n))}}const On=new Map([]);function An(s){const e=On.get(s);e&&e()}class Nn extends Rn{constructor(t,n){super(t);d(this,"category");d(this,"triggers");d(this,"triggerTiming");d(this,"isMandatory");d(this,"selfOnly");d(this,"dslDefinition");this.dslDefinition=n,this.category=n.category,this.triggers=n.triggers??[],this.triggerTiming=n.triggerTiming??"if",this.isMandatory=n.isMandatory??!0,this.selfOnly=n.selfOnly??!1}individualConditions(t){return!0}createTriggerSteps(t,n){const i=this.dslDefinition.resolutions??[],a={cardId:this.cardId,sourceInstanceId:n.instanceId};return i.map(o=>W(o.step,o.args??{},a))}}class Qe extends le{constructor(){super(...arguments);d(this,"spellSpeed",1)}subTypeConditions(t,n){return l.Phase.isMain(t.phase)?r.Validation.success():r.Validation.failure(r.Validation.ERROR_CODES.NOT_MAIN_PHASE)}subTypePreActivationSteps(t,n){return[]}subTypePostActivationSteps(t,n){return[]}subTypePreResolutionSteps(t,n){return[]}subTypePostResolutionSteps(t,n){return[]}static createNoOp(t){return new Dn(t)}}class Dn extends Qe{constructor(e){super(e)}individualConditions(){return r.Validation.success()}individualActivationSteps(){return[]}individualResolutionSteps(){return[]}}function Xe(s){const{id:e,data:t}=s;F.register(e,{jaName:t.jaName,type:t.type,frameType:t.frameType,spellType:t.spellType,trapType:t.trapType,edition:t.edition??"latest",level:t.level,attack:t.attack,defense:t.defense})}function bn(s){const{id:e,data:t}=s,n=s["effect-chainable-actions"];if(!n)return;const i=t.spellType;if(n.activations)if(i==="normal"){const a=pn(e,n.activations);E.registerActivation(e,a)}else if(i==="quick-play"){const a=Sn(e,n.activations);E.registerActivation(e,a)}else if(i==="continuous"){const a=vn(e,n.activations);E.registerActivation(e,a)}else throw new Error(`Unsupported spell type "${i}" for card ID ${e}`);else if(i==="field"){const a=Qe.createNoOp(e);E.registerActivation(e,a)}n.ignitions&&n.ignitions.forEach((a,o)=>{const c=En(e,o+1,a);E.registerIgnition(e,c)}),n.triggers&&n.triggers.forEach((a,o)=>{const c=_n(e,o+1,a);E.registerTrigger(e,c)})}function Vn(s){const{id:e}=s,t=s["effect-additional-rules"];if(t&&t.continuous)for(const n of t.continuous){const i=new Nn(e,n);ce.register(e,i)}}function Pn(s){const e=We(s);Xe(e)}function Ln(s){const e=We(s);Xe(e),bn(e),Vn(e)}const kn=new Map([]);function xn(s){const e=kn.get(s);e&&e()}const $=(s,e,t)=>[e,()=>F.register(e,{jaName:t,type:"monster",frameType:s,edition:"latest"})],wn=(s,e,t)=>[e,()=>F.register(e,{jaName:t,type:"trap",frameType:"trap",trapType:s,edition:"latest"})],Mn=new Map([$("effect",33396948,"封印されしエクゾディア"),$("normal",7902349,"封印されし者の右腕"),$("normal",70903634,"封印されし者の左腕"),$("normal",44519536,"封印されし者の左足"),$("normal",8124921,"封印されし者の右足"),wn("normal",83968380,"強欲な瓶")]);function Je(s){const e=Mn.get(s);e&&e()}function Fn(s){F.clear();for(const e of s){const t=Ye.get(e);if(t){Pn(t);continue}Je(e)}}function Gn(s){F.clear(),E.clear(),ce.clear();for(const e of s){const t=Ye.get(e);if(t){Ln(t);continue}Je(e),xn(e),An(e)}}const Un=(s,e,t,n,i)=>({success:!0,updatedState:l.checkVictory(s),message:e,emittedEvents:t,activationSteps:n??[],chainBlock:i}),jn=(s,e)=>({success:!1,updatedState:s,error:e,activationSteps:[]}),b={Result:{success:Un,failure:jn}};class Hn{constructor(){d(this,"description");this.description="Advance to next phase"}canExecute(e){if(e.result.isGameOver)return r.Validation.failure(r.Validation.ERROR_CODES.GAME_OVER);const t=l.Phase.next(e.phase);return l.Phase.changeable(e.phase,t).valid?r.Validation.success():r.Validation.failure(r.Validation.ERROR_CODES.PHASE_TRANSITION_NOT_ALLOWED)}execute(e){const t=this.canExecute(e);if(!t.isValid)return b.Result.failure(e,r.Validation.errorMessage(t));const n=l.Phase.next(e.phase),i=l.Phase.isEnd(n)&&e.queuedEndPhaseEffectIds.length>0,a=l.Phase.isEnd(n)?this.resetFieldCardActivatedEffects(e.space):e.space,o={...e,space:a,phase:n,activatedCardIds:l.Phase.isEnd(n)?new Set:e.activatedCardIds,queuedEndPhaseEffectIds:i?[]:e.queuedEndPhaseEffectIds};return b.Result.success(o,`${l.Phase.displayName(n)} です`)}getNextPhase(e){return l.Phase.next(e.phase)}resetFieldCardActivatedEffects(e){const t=n=>{if(!n.stateOnField||n.stateOnField.activatedEffects.size===0)return n;const i={...n.stateOnField,activatedEffects:new Set};return{...n,stateOnField:i}};return{...e,mainMonsterZone:e.mainMonsterZone.map(t),spellTrapZone:e.spellTrapZone.map(t),fieldZone:e.fieldZone.map(t)}}}function $e(s){return l.Phase.isMain(s.phase)?l.Space.isMainMonsterZoneFull(s.space)?r.Validation.failure(r.Validation.ERROR_CODES.MONSTER_ZONE_FULL):s.normalSummonUsed>=s.normalSummonLimit?r.Validation.failure(r.Validation.ERROR_CODES.SUMMON_LIMIT_REACHED):r.Validation.success():r.Validation.failure(r.Validation.ERROR_CODES.NOT_MAIN_PHASE)}function et(s,e,t){const n=l.Space.findCard(s.space,e),i=l.Space.moveCard(s.space,n,"mainMonsterZone",{position:t==="attack"?"faceUp":"faceDown",battlePosition:t});return{...s,space:i,normalSummonUsed:s.normalSummonUsed+1}}class ke{constructor(e){d(this,"description");this.cardInstanceId=e,this.description=`Summon monster ${e}`}canExecute(e){if(e.result.isGameOver)return r.Validation.failure(r.Validation.ERROR_CODES.GAME_OVER);const t=$e(e);if(!t.isValid)return t;const n=l.Space.findCard(e.space,this.cardInstanceId);return n?f.isMonster(n)?f.Instance.inHand(n)?r.Validation.success():r.Validation.failure(r.Validation.ERROR_CODES.CARD_NOT_IN_HAND):r.Validation.failure(r.Validation.ERROR_CODES.NOT_MONSTER_CARD):r.Validation.failure(r.Validation.ERROR_CODES.CARD_NOT_FOUND)}execute(e){const t=this.canExecute(e);if(!t.isValid)return b.Result.failure(e,r.Validation.errorMessage(t));const n=l.Space.findCard(e.space,this.cardInstanceId),i=et(e,this.cardInstanceId,"attack"),a=l.Space.findCard(i.space,this.cardInstanceId),o=[dn(a)];return b.Result.success(i,`${f.nameWithBrackets(n)}を召喚します`,void 0,o)}getCardInstanceId(){return this.cardInstanceId}}class xe{constructor(e){d(this,"description");this.cardInstanceId=e,this.description=`Set monster ${e}`}canExecute(e){if(e.result.isGameOver)return r.Validation.failure(r.Validation.ERROR_CODES.GAME_OVER);const t=$e(e);if(!t.isValid)return t;const n=l.Space.findCard(e.space,this.cardInstanceId);return n?f.isMonster(n)?f.Instance.inHand(n)?r.Validation.success():r.Validation.failure(r.Validation.ERROR_CODES.CARD_NOT_IN_HAND):r.Validation.failure(r.Validation.ERROR_CODES.NOT_MONSTER_CARD):r.Validation.failure(r.Validation.ERROR_CODES.CARD_NOT_FOUND)}execute(e){const t=this.canExecute(e);if(!t.isValid)return b.Result.failure(e,r.Validation.errorMessage(t));const n=l.Space.findCard(e.space,this.cardInstanceId),i=et(e,this.cardInstanceId,"defense");return b.Result.success(i,`${f.nameWithBrackets(n)}をセットします`)}getCardInstanceId(){return this.cardInstanceId}}class we{constructor(e){d(this,"description");this.cardInstanceId=e,this.description=`Set spell/trap ${e}`}canExecute(e){if(e.result.isGameOver)return r.Validation.failure(r.Validation.ERROR_CODES.GAME_OVER);if(!l.Phase.isMain(e.phase))return r.Validation.failure(r.Validation.ERROR_CODES.NOT_MAIN_PHASE);const t=l.Space.findCard(e.space,this.cardInstanceId);return t?!f.isSpell(t)&&!f.isTrap(t)?r.Validation.failure(r.Validation.ERROR_CODES.NOT_SPELL_OR_TRAP_CARD):f.Instance.inHand(t)?!f.isFieldSpell(t)&&l.Space.isSpellTrapZoneFull(e.space)?r.Validation.failure(r.Validation.ERROR_CODES.SPELL_TRAP_ZONE_FULL):r.Validation.success():r.Validation.failure(r.Validation.ERROR_CODES.CARD_NOT_IN_HAND):r.Validation.failure(r.Validation.ERROR_CODES.CARD_NOT_FOUND)}execute(e){const t=this.canExecute(e);if(!t.isValid)return b.Result.failure(e,r.Validation.errorMessage(t));const n=l.Space.findCard(e.space,this.cardInstanceId),i={...e,space:this.moveSetSpellTrapCard(e.space,n)};return b.Result.success(i,`${f.nameWithBrackets(n)}をセットします`)}moveSetSpellTrapCard(e,t){if(f.isFieldSpell(t)){const n=l.Space.sendExistingFieldSpellToGraveyard(e);return l.Space.moveCard(n,t,"fieldZone",{position:"faceDown"})}return l.Space.moveCard(e,t,"spellTrapZone",{position:"faceDown"})}getCardInstanceId(){return this.cardInstanceId}}function tt(s,e){if(f.Instance.inHand(e)){if(f.isFieldSpell(e)){const t=l.Space.sendExistingFieldSpellToGraveyard(s);return l.Space.moveCard(t,e,"fieldZone",{position:"faceUp"})}if(f.isSpell(e)||f.isTrap(e))return l.Space.moveCard(s,e,"spellTrapZone",{position:"faceUp"});throw new Error("Invalid card type for activation")}return l.Space.updateCardStateInPlace(s,e,{position:"faceUp"})}class Me{constructor(e){d(this,"description");this.cardInstanceId=e,this.description=`Activate spell card ${e}`}canExecute(e){if(e.result.isGameOver)return r.Validation.failure(r.Validation.ERROR_CODES.GAME_OVER);const t=l.Space.findCard(e.space,this.cardInstanceId);if(!t)return r.Validation.failure(r.Validation.ERROR_CODES.CARD_NOT_FOUND);if(!f.isSpell(t))return r.Validation.failure(r.Validation.ERROR_CODES.NOT_SPELL_CARD);if(!f.Instance.inHand(t)&&!(f.Instance.onField(t)&&f.Instance.isFaceDown(t)))return r.Validation.failure(r.Validation.ERROR_CODES.CARD_NOT_IN_VALID_LOCATION);if(!f.isFieldSpell(t)&&l.Space.isSpellTrapZoneFull(e.space))return r.Validation.failure(r.Validation.ERROR_CODES.SPELL_TRAP_ZONE_FULL);const n=E.getActivation(t.id);if(!n)return r.Validation.failure(r.Validation.ERROR_CODES.EFFECT_NOT_REGISTERED);const i=n.canActivate(e,t);return i.isValid?r.Validation.success():i}execute(e){const t=this.canExecute(e);if(!t.isValid)return b.Result.failure(e,r.Validation.errorMessage(t));const n=l.Space.findCard(e.space,this.cardInstanceId),i={...e,space:tt(e.space,n),activatedCardIds:l.updatedActivatedCardIds(e.activatedCardIds,n.id)},a=E.getActivation(n.id),o=(a==null?void 0:a.createActivationSteps(i,n))??[],c=(a==null?void 0:a.createResolutionSteps(i,n))??[],u=a?{effectId:a.effectId,sourceInstanceId:n.instanceId,sourceCardId:n.id,spellSpeed:a.spellSpeed,resolutionSteps:c,isNegated:!1}:void 0;return b.Result.success(i,void 0,[],o,u)}getCardInstanceId(){return this.cardInstanceId}}class Fe{constructor(e){d(this,"description");this.cardInstanceId=e,this.description=`Activate ignition effect of ${e}`}canExecute(e){if(e.result.isGameOver)return r.Validation.failure(r.Validation.ERROR_CODES.GAME_OVER);const t=l.Space.findCard(e.space,this.cardInstanceId);if(!t)return r.Validation.failure(r.Validation.ERROR_CODES.CARD_NOT_FOUND);if(!["fieldZone","spellTrapZone","mainMonsterZone"].includes(t.location))return r.Validation.failure(r.Validation.ERROR_CODES.CARD_NOT_ON_FIELD);if(!f.Instance.isFaceUp(t))return r.Validation.failure(r.Validation.ERROR_CODES.CARD_NOT_FACE_UP);const i=E.getIgnitionEffects(t.id);return i.length===0?r.Validation.failure(r.Validation.ERROR_CODES.NO_IGNITION_EFFECT):this.findActivatableEffect(i,e,t)?r.Validation.success():r.Validation.failure(r.Validation.ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET)}findActivatableEffect(e,t,n){return e.find(i=>i.canActivate(t,n).isValid)}execute(e){const t=this.canExecute(e);if(!t.isValid)return b.Result.failure(e,r.Validation.errorMessage(t));const n=l.Space.findCard(e.space,this.cardInstanceId),i=E.getIgnitionEffects(n.id),a=this.findActivatableEffect(i,e,n),o=n.stateOnField,c=new Set(o.activatedEffects);c.add(a.effectId);const u={...e,space:l.Space.updateCardStateInPlace(e.space,n,{activatedEffects:c})},g=a.createActivationSteps(u,n),h=a.createResolutionSteps(u,n),k={effectId:a.effectId,sourceInstanceId:n.instanceId,sourceCardId:n.id,spellSpeed:a.spellSpeed,resolutionSteps:h,isNegated:!1};return b.Result.success(u,void 0,[],g,k)}getCardInstanceId(){return this.cardInstanceId}}function nt(){return l.initialize({mainDeckCardIds:[],extraDeckCardIds:[]},F.getCard,{skipShuffle:!0,skipInitialDraw:!0})}const w=oe(nt());function Bn(s){const e=[];s.mainDeck.forEach(n=>{for(let i=0;i<n.quantity;i++)e.push(n.id)});const t=[];return s.extraDeck.forEach(n=>{for(let i=0;i<n.quantity;i++)t.push(n.id)}),{mainDeckCardIds:e,extraDeckCardIds:t}}function Zn(s){const e=Bn(s);w.set(l.initialize(e,F.getCard))}function ee(){let s=nt();return w.subscribe(t=>{s=t})(),s}function Ge(){return{isBuilding:!1,stack:[],currentChainNumber:0,lastSpellSpeed:null}}function Yn(){const{subscribe:s,update:e,set:t}=oe(Ge()),n={subscribe:s,startChain:()=>{e(i=>({...i,isBuilding:!0,currentChainNumber:1}))},pushChainBlock:i=>{e(a=>{const o={...i,chainNumber:a.currentChainNumber};return{...a,stack:[...a.stack,o],currentChainNumber:a.currentChainNumber+1,lastSpellSpeed:i.spellSpeed}})},endChainBuilding:()=>{e(i=>({...i,isBuilding:!1}))},popChainBlock:()=>{const i=m(n);if(i.stack.length===0)return;const a=i.stack[i.stack.length-1];return e(o=>({...o,stack:o.stack.slice(0,-1)})),a},canChain:i=>{const a=m(n);return a.isBuilding?i>=(a.lastSpellSpeed??1):i>=1},isEmpty:()=>m(n).stack.length===0,isBuilding:()=>m(n).isBuilding,getStackSize:()=>m(n).stack.length,getState:()=>m(n),getStackedInstanceIds:()=>{const i=m(n);return new Set(i.stack.map(a=>a.sourceInstanceId))},getRequiredSpellSpeed:()=>{const i=m(n);return i.stack.length===0?1:Math.max(2,i.lastSpellSpeed??2)},reset:()=>{t(Ge())}};return n}const T=Yn();function de(s,e,t){const n=s.action(e,t);return n.success?(w.set(n.updatedState),{updatedState:n.updatedState,emittedEvents:n.emittedEvents||[]}):{updatedState:e,emittedEvents:[]}}function Wn(s,e,t,n){const i=[];for(const a of s){const o=ce.collectTriggerSteps(e,a);i.push(...o);const c=E.collectTriggerSteps(e,a,u=>{T.pushChainBlock(u)});i.push(...c)}return i.length===0?t:[...t.slice(0,n+1),...i,...t.slice(n+1)]}function Ue(s,e){const t=s.currentIndex+1;return t<s.steps.length?(e(n=>({...n,currentIndex:t,currentStep:n.steps[t]})),!0):(Ie(e),!1)}function Ie(s){if(s(e=>({...e,isActive:!1,currentStep:null,steps:[],currentIndex:-1})),T.isEmpty())T.reset();else if(T.isBuilding()){const e=m(w),t=T.getRequiredSpellSpeed(),n=T.getStackedInstanceIds(),i=E.collectChainableActions(e,t,n);if(i.length>0){s(a=>({...a,chainConfirmationConfig:{chainableCards:i,onActivate:o=>{const c=i.find(u=>u.instance.instanceId===o);c&&C.activateChain(c.instance,c.action)},onPass:()=>{s(o=>({...o,chainConfirmationConfig:null})),C.resolveChain()}}}));return}setTimeout(()=>{C.resolveChain()},0)}else setTimeout(()=>{C.continueChainResolution()},0)}const zn=async(s,e)=>({shouldContinue:!0,emittedEvents:de(s,e).emittedEvents}),qn=async(s,e,t)=>{const n=de(s,e);return t.notification&&t.notification.showInfo(s.summary,s.description),{shouldContinue:!0,delay:300,emittedEvents:n.emittedEvents}},Kn=async(s,e,t,n)=>{const i=s.cardSelectionConfig;let a;if(i.availableCards!==null)a=i.availableCards;else{if(!i._sourceZone)return console.error("_sourceZone must be specified when availableCards is null"),{shouldContinue:!1};const c=e.space[i._sourceZone];a=i._filter?c.filter((u,g)=>i._filter(u,g)):c}let o=[];return await new Promise(c=>{n(u=>({...u,cardSelectionConfig:{availableCards:a,minCards:i.minCards,maxCards:i.maxCards,summary:i.summary,description:i.description,cancelable:i.cancelable,onConfirm:g=>{o=de(s,e,g).emittedEvents,n(k=>({...k,cardSelectionConfig:null})),c()},onCancel:()=>{n(g=>({...g,cardSelectionConfig:null})),c()}}}))}),{shouldContinue:!0,emittedEvents:o}},Qn=async(s,e,t,n)=>{let i=[];return await new Promise(a=>{n(o=>({...o,confirmationConfig:{summary:s.summary,description:s.description,onConfirm:()=>{i=de(s,e).emittedEvents,n(u=>({...u,confirmationConfig:null})),a()}}}))}),{shouldContinue:!0,emittedEvents:i}};function Xn(s){const e=s.notificationLevel||"info";return e==="silent"?zn:e==="info"?qn:s.cardSelectionConfig?Kn:Qn}function Jn(){const{subscribe:s,update:e}=oe({isActive:!1,currentStep:null,steps:[],currentIndex:-1,notificationHandler:null,confirmationConfig:null,cardSelectionConfig:null,chainConfirmationConfig:null,eventTimeline:r.TimeLine.createEmptyTimeline()});return{subscribe:s,registerNotificationHandler:t=>{e(n=>({...n,notificationHandler:t}))},startProcessing:t=>{e(i=>({...i,isActive:!0,steps:t,currentIndex:0,currentStep:t[0]||null}));const n=t[0];if(n){const i=n.notificationLevel||"info";(i==="info"||i==="silent")&&C.confirmCurrentStep()}},confirmCurrentStep:async()=>{let t=m(C);if(!t.currentStep)return;if(kt(t.currentStep)){e(c=>({...c,eventTimeline:r.TimeLine.advanceTime(c.eventTimeline)})),Ue(t,e)&&C.confirmCurrentStep();return}const n=m(w),a=await Xn(t.currentStep)(t.currentStep,n,{notification:t.notificationHandler},e);if(a.emittedEvents&&a.emittedEvents.length>0){let o=t.eventTimeline;for(const g of a.emittedEvents)o=r.TimeLine.recordEvent(o,g);const c=m(w),u=Wn(a.emittedEvents,c,t.steps,t.currentIndex);e(g=>({...g,steps:u,eventTimeline:o})),t=m(C)}a.delay&&await new Promise(o=>setTimeout(o,a.delay)),a.shouldContinue?Ue(t,e)&&C.confirmCurrentStep():Ie(e)},activateChain:(t,n)=>{e(u=>({...u,chainConfirmationConfig:null}));const i=m(w),a={...i,space:tt(i.space,t),activatedCardIds:l.updatedActivatedCardIds(i.activatedCardIds,t.id)};w.set(a);const o=n.createActivationSteps(a,t),c=n.createResolutionSteps(a,t);T.pushChainBlock({sourceInstanceId:t.instanceId,sourceCardId:t.id,effectId:n.effectId,spellSpeed:n.spellSpeed,resolutionSteps:c,isNegated:!1}),o.length>0?C.startProcessing(o):Ie(e)},resolveChain:()=>{T.endChainBuilding(),C.continueChainResolution()},continueChainResolution:()=>{const t=T.popChainBlock();if(!t){T.reset();return}!t.isNegated&&t.resolutionSteps.length>0?(e(n=>({...n,isActive:!0,steps:t.resolutionSteps,currentIndex:0,currentStep:t.resolutionSteps[0]||null})),C.confirmCurrentStep()):C.continueChainResolution()},cancelProcessing:()=>{e(t=>({...t,isActive:!1,currentStep:null,steps:[],currentIndex:-1}))},reset:()=>{e(t=>({...t,isActive:!1,currentStep:null,steps:[],currentIndex:-1}))}}}const C=Jn();class $n{canExecuteCommand(e,...t){const n=ee();return new e(...t).canExecute(n).isValid}executeCommand(e,...t){const n=ee(),a=new e(...t).execute(n);return a.success&&(w.set(a.updatedState),a.chainBlock&&(T.getStackSize()===0&&T.startChain(),T.pushChainBlock(a.chainBlock)),a.activationSteps&&a.activationSteps.length>0?C.startProcessing(a.activationSteps):a.chainBlock&&C.resolveChain()),{success:a.success,message:a.message,error:a.error}}loadDeck(e){const t=De(e),n=be(t);return Fn(n),{deckData:Ve(t,n),uniqueCardIds:n}}initializeGame(e){const t=De(e),n=be(t);Gn(n);const i=Ve(t,n);return this.startGame(t),{deckData:i,uniqueCardIds:n}}startGame(e){Zn(e)}getGameState(){return ee()}findCardOnField(e){const t=ee();return[...t.space.mainMonsterZone,...t.space.spellTrapZone,...t.space.fieldZone].find(i=>i.instanceId===e)}advancePhase(){return this.executeCommand(Hn)}async autoAdvanceToMainPhase(e,t){const n=ee();if(n.turn!==1||n.phase!=="draw")return!1;for(let i=0;i<2;i++){e&&await e();const a=this.advancePhase();if(a.success)a.message&&t&&t(a.message);else return console.error(`[GameFacade] Auto advance failed: ${a.error}`),!1}return!0}canSummonMonster(e){return this.canExecuteCommand(ke,e)}summonMonster(e){return this.executeCommand(ke,e)}canSetMonster(e){return this.canExecuteCommand(xe,e)}setMonster(e){return this.executeCommand(xe,e)}canSetSpellTrap(e){return this.canExecuteCommand(we,e)}setSpellTrap(e){return this.executeCommand(we,e)}canActivateSpell(e){return this.canExecuteCommand(Me,e)}activateSpell(e){return this.executeCommand(Me,e)}canActivateIgnitionEffect(e){return this.canExecuteCommand(Fe,e)}activateIgnitionEffect(e){return this.executeCommand(Fe,e)}}const zi=new $n;function ei(){return{credentials:"same-origin"}}async function ti(s,e,t){try{return await s(e,t)}catch(n){throw console.error("API error:",n),new Error(`Failed to fetch: ${t.method} ${e}`)}}const ni=z({id:te(),image_url:p(),image_url_small:p(),image_url_cropped:p()}),ii=z({set_name:p(),set_code:p(),set_rarity:p(),set_rarity_code:p(),set_price:p()}),ai=z({cardmarket_price:p(),tcgplayer_price:p(),ebay_price:p(),amazon_price:p(),coolstuffinc_price:p()}),si=z({ban_tcg:p().optional(),ban_ocg:p().optional(),ban_goat:p().optional()}),ri=z({id:te(),name:p(),type:p(),humanReadableCardType:p(),frameType:p(),desc:p(),race:p(),ygoprodeck_url:p(),archetype:p().optional(),typeline:ne(p()).optional(),atk:te().optional(),def:te().optional(),level:te().optional(),attribute:p().optional(),banlist_info:si.optional(),card_images:ne(ni),card_sets:ne(ii).optional(),card_prices:ne(ai).optional()}),oi=z({data:ne(ri)});function it(s){const e=s.card_images[0];return{id:s.id,name:s.name,type:s.type,frameType:s.frameType,desc:s.desc,archetype:s.archetype,atk:s.atk,def:s.def,level:s.level,attribute:s.attribute,race:s.type.toLowerCase().includes("monster")?s.race:void 0,images:e?{image:e.image_url,imageSmall:e.image_url_small,imageCropped:e.image_url_cropped}:null}}const ci="https://db.ygoprodeck.com/api/v7",at="cardinfo.php",je=new Map;async function st(s,e){const n={...ei(),method:"GET"},i=`${ci}/${e}`;try{const a=await ti(s,i,n);if(!a.ok){if(console.error(`YGOPRODeck API Error: ${a.status} ${a.statusText} - ${i}`),a.status===429)throw new Error("YGOPRODeck API rate limit exceeded. Please reduce request frequency.");return null}const o=await a.json();return oi.parse(o)}catch(a){throw a instanceof xt?console.error("YGOPRODeck API response validation failed:",a.issues):console.error("YGOPRODeck API fetch failed:",a),a}}async function li(s,e){const t=`${at}?id=${e}`,n=await st(s,t),i=n==null?void 0:n.data[0];return i?it(i):null}async function di(s,e){if(e.length===0)return[];const t=[],n=[];for(const a of e){const o=je.get(a);o?t.push(o):n.push(a)}let i=[];if(n.length>0){const a=n.join(","),o=`${at}?id=${a}`,c=await st(s,o);if(c!=null&&c.data){i=c.data;for(const u of i)je.set(u.id,u)}}return[...t,...i].map(it)}class ui{async getCardsByIds(e,t){return di(e,t)}async getCardById(e,t){const n=await li(e,t);if(!n)throw new Error(`Card not found: ID ${t}`);return n}}let ve=null;function fi(){return ve||(ve=new ui),ve}function pi(s){const e=s.toLowerCase();return e.includes("monster")?"monster":e.includes("spell")?"spell":e.includes("trap")?"trap":null}function mi(s){return s.toLowerCase()}function gi(s,e){const t=`${e.jaName} (ID: ${e.id})`,n=pi(s.type);n&&n!==e.type&&console.warn(`[CardData Mismatch] ${t}: type が一致しません。Domain="${e.type}", API="${n}" (raw: "${s.type}")`);const i=mi(s.frameType);i!==e.frameType&&console.warn(`[CardData Mismatch] ${t}: frameType が一致しません。Domain="${e.frameType}", API="${i}" (raw: "${s.frameType}")`)}function Si(s,e){gi(s,e);const t=e.type==="monster"&&s.atk!==void 0&&s.def!==void 0&&s.level!==void 0?{attack:s.atk,defense:s.def,level:s.level,attribute:s.attribute??"",race:s.race??""}:void 0;return{id:e.id,name:s.name,jaName:e.jaName,type:e.type,description:s.desc,frameType:e.frameType,archetype:s.archetype,monsterAttributes:t,images:s.images??void 0}}function hi(s){const e=F.get(s.id);return Si(s,e)}function Ci(s){return s.map(e=>hi(e))}const vi={isInitialized:!1,isLoading:!1,error:null,data:new Map},L=oe(vi),Ii=fi();async function qi(s){const e=m(L);if(!(e.isInitialized&&s.every(t=>e.data.has(t)))){L.update(t=>({...t,isLoading:!0,error:null}));try{const t=s.filter(n=>!e.data.has(n));if(t.length>0){const n=await Ii.getCardsByIds(fetch,t),i=Ci(n);L.update(a=>{const o=new Map(a.data);return i.forEach(c=>{o.set(c.id,c)}),{...a,isInitialized:!0,isLoading:!1,data:o}})}else L.update(n=>({...n,isInitialized:!0,isLoading:!1}))}catch(t){const n=t instanceof Error?t.message:"Failed to initialize display card data cache";throw console.error("[displayCardDataCache] Initialization error:",t),L.update(i=>({...i,isLoading:!1,error:n})),t}}}function Ki(s){return m(L).data.get(s)}const Qi={subscribe:L.subscribe,get isInitialized(){return m(L).isInitialized},get isLoading(){return m(L).isLoading},get error(){return m(L).error}},yi={small:"w-16 h-24",medium:"w-22 h-32",large:"w-32 h-48"},Ei={small:"w-4 h-4 text-xs",medium:"w-6 h-6 text-xs",large:"w-8 h-8 text-sm"},Ti=""+new URL("../assets/CardBack.DGn8cQOG.jpg",import.meta.url).href;var _i=_('<div class="w-full h-full flex items-center justify-center p-1"><img alt="裏向きカード" class="w-full h-full object-cover rounded-sm"/></div>'),Ri=_('<img class="w-full h-full object-cover rounded-sm"/>'),Oi=_('<span class="text-xs opacity-75 select-none mt-1"> </span>'),Ai=_('<div class="w-full h-full bg-surface-200-700-token rounded-sm flex flex-col items-center justify-center text-center overflow-hidden"><img class="w-full h-full object-cover opacity-30"/> <div class="absolute inset-0 flex flex-col items-center justify-center"><span class="text-xs select-none text-surface-600-300-token font-medium"> </span> <!></div></div>'),Ni=_('<div class="w-full h-full bg-surface-200-700-token rounded-sm flex items-center justify-center"><img alt="" class="w-full h-full object-cover opacity-20"/> <div class="absolute inset-0 flex items-center justify-center"><span class="text-xs opacity-50 select-none">No Image</span></div></div>'),Di=_('<div class="px-1 py-1 bg-surface-50-900-token border-t border-surface-300"><div class="text-xs font-medium truncate"> </div></div>'),bi=_('<div class="flex-1 flex items-center justify-center p-1"><!></div> <!>',1),Vi=_('<div class="absolute top-1 right-1 w-3 h-3 bg-primary-500 rounded-full animate-pulse"></div>'),Pi=_('<div class="absolute inset-0 bg-primary-500 opacity-10 pointer-events-none"></div>'),Li=_("<!> <!> <!>",1),ki=_("<button><!></button>"),xi=_("<div><!></div>");function Xi(s,e){Be(e,!0);const t=v=>{var R=Li(),H=he(R);{var K=I=>{var V=_i(),Q=A(V);N(V),j(()=>Y(Q,"src",pe)),y(I,V)},ht=I=>{var V=bi(),Q=he(V),yt=A(Q);{var Et=P=>{var O=Ri();j(()=>{Y(O,"src",e.card.images.imageCropped),Y(O,"alt",e.card.jaName||"カード")}),y(P,O)},Tt=(P,O)=>{{var G=B=>{var U=Ai(),X=A(U),Ne=J(X,2),ge=A(Ne),Ot=A(ge,!0);N(ge);var At=J(ge,2);{var Nt=Se=>{var Z=Oi(),Dt=A(Z,!0);N(Z),j(()=>re(Dt,e.card.type)),y(Se,Z)};M(At,Se=>{var Z;(Z=e.card)!=null&&Z.type&&Se(Nt)})}N(Ne),N(U),j(()=>{Y(X,"src",pe),Y(X,"alt",u()),re(Ot,u())}),y(B,U)},me=B=>{var U=Ni(),X=A(U);Ft(2),N(U),j(()=>Y(X,"src",pe)),y(B,U)};M(P,B=>{S(Te)?B(G):B(me,!1)},O)}};M(yt,P=>{var O,G;(G=(O=e.card)==null?void 0:O.images)!=null&&G.imageCropped?P(Et):P(Tt,!1)})}N(Q);var _t=J(Q,2);{var Rt=P=>{var O=Di(),G=A(O),me=A(G,!0);N(G),N(O),j(()=>re(me,e.card.jaName)),y(P,O)};M(_t,P=>{e.card&&!S(Te)&&P(Rt)})}y(I,V)};M(H,I=>{ue()?I(K):I(ht,!1)})}var Ae=J(H,2);{var Ct=I=>{var V=Vi();y(I,V)};M(Ae,I=>{S(fe)&&I(Ct)})}var vt=J(Ae,2);{var It=I=>{var V=Pi();y(I,V)};M(vt,I=>{h()&&(S(q)||S(fe))&&I(It)})}y(v,R)};let n=D(e,"size",3,"medium"),i=D(e,"clickable",3,!1),a=D(e,"selectable",3,!1),o=D(e,"isSelected",3,!1),c=D(e,"placeholder",3,!1),u=D(e,"placeholderText",3,"カード"),g=D(e,"rotation",3,0),h=D(e,"animate",3,!0),k=D(e,"showDetailOnClick",3,!1),ue=D(e,"faceDown",3,!1),q=Pe(!1),ae=Pe(!1),fe=x(()=>a()?S(ae):o());Mt(()=>{a()||se(ae,o())});function rt(){var v;console.log(`[Card] クリックイベント発生: clickable=${i()}, card=${(v=e.card)==null?void 0:v.jaName}, hasOnClick=${!!e.onClick}`),i()&&e.card&&e.onClick&&(console.log(`[Card] onClickコールバックを実行します: ${e.card.jaName}`),e.onClick(e.card)),a()&&se(ae,!S(ae)),k()&&e.card&&jt(e.card)}function ot(){se(q,!0),e.onHover&&e.card&&e.onHover(e.card)}function ct(){se(q,!1),e.onHover&&e.onHover(null)}const Te=x(()=>c()||!e.card),pe=Ti,lt=x(()=>h()?"transition-all duration-300 ease-in-out":""),dt=x(()=>i()||a()||k()?"cursor-pointer hover:scale-105 hover:shadow-lg":""),ut=x(()=>S(fe)?"ring-2 ring-primary-500 shadow-lg":""),ft=x(()=>g()!==0?`transform: rotate(${g()}deg);`:""),pt=x(()=>()=>{var v;return Ut((v=e.card)==null?void 0:v.frameType)}),_e=x(()=>()=>`
      ${yi[n()]}
      ${S(lt)}
      ${S(dt)}
      ${S(ut)}
      ${S(pt)()}
      border border-surface-300 rounded aspect-[3/4] flex flex-col justify-between
      relative overflow-hidden
    `),Re=x(()=>({style:S(ft),onclick:i()||a()||k()?rt:void 0,onmouseenter:ot,onmouseleave:ct}));var Oe=wt(),mt=he(Oe);{var gt=v=>{var R=ki();Le(R,K=>({class:`${K??""} bg-transparent p-0 border border-2 border-gray-100`,...S(Re)}),[()=>S(_e)()]);var H=A(R);t(H),N(R),y(v,R)},St=v=>{var R=xi();Le(R,K=>({class:K,role:"img",...S(Re)}),[()=>S(_e)()]);var H=A(R);t(H),N(R),y(v,R)};M(mt,v=>{i()||a()||k()?v(gt):v(St,!1)})}y(s,Oe),Ze()}var wi=_("<div> </div>");function Ji(s,e){Be(e,!0);let t=D(e,"size",3,"medium"),n=D(e,"colorClasses",3,"bg-primary-200 text-primary-900");var i=wi(),a=A(i,!0);N(i),j(()=>{Gt(i,1,`absolute -top-2 -right-2 ${Ei[t()]??""} ${n()??""} rounded-full flex items-center justify-center font-bold shadow-md z-10`),re(a,e.count)}),y(s,i),Ze()}export{Xi as C,Ki as a,Ji as b,w as c,Qi as d,yi as e,Ti as f,zi as g,C as h,qi as i};
