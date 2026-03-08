var bt=Object.defineProperty;var Vt=(a,e,t)=>e in a?bt(a,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):a[e]=t;var d=(a,e,t)=>Vt(a,typeof e!="symbol"?e+"":e,t);import{j as Pt,C as kt,E as Ie,G as r,n as Ee,b as f,c as l,s as je,d as Z,e as ne,f as j,i as Lt,h as Ne,k as De,l as be,o as W,m as p,p as ee,q as te,r as xt}from"./DpaWYjkJ.js";import{w as re,g as m}from"./CebzHo8n.js";import{c as wt,a as E,f as R}from"./C2j_5X9e.js";import{l as Be,F as Ft,t as se,aq as Ve,m as he,n as He,w as S,ar as k,z as O,B as N,y as J,x as U,ay as Mt}from"./8IcbDFZa.js";import{s as ae}from"./CjT8C9BD.js";import{i as F}from"./_4Sr1Rl8.js";import{a as Pe,b as q,s as Gt}from"./C076Ff9n.js";import{p as D}from"./BzOwF7ft.js";import{b as Ut,c as jt,d as Bt}from"./DSFieJQH.js";const Ht=`# 《封印されしエクゾディア》 (Exodia the Forbidden One)
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
  attribute: "DARK"
  race: "Spellcaster"
  level: 3
  attack: 1000
  defense: 1000
`,Yt=`# 《封印されし者の右腕》 (Right Arm of the Forbidden One)

id: 70903634

data:
  jaName: "封印されし者の右腕"
  type: "monster"
  frameType: "normal"
  attribute: "DARK"
  race: "Spellcaster"
  level: 1
  attack: 200
  defense: 300
`,qt=`# 《封印されし者の左腕》 (Left Arm of the Forbidden One)

id: 7902349

data:
  jaName: "封印されし者の左腕"
  type: "monster"
  frameType: "normal"
  attribute: "DARK"
  race: "Spellcaster"
  level: 1
  attack: 200
  defense: 300
`,Zt=`# 《封印されし者の右足》 (Right Leg of the Forbidden One)

id: 8124921

data:
  jaName: "封印されし者の右足"
  type: "monster"
  frameType: "normal"
  attribute: "DARK"
  race: "Spellcaster"
  level: 1
  attack: 200
  defense: 300
`,Wt=`# 《封印されし者の左足》 (Left Leg of the Forbidden One)

id: 44519536

data:
  jaName: "封印されし者の左足"
  type: "monster"
  frameType: "normal"
  attribute: "DARK"
  race: "Spellcaster"
  level: 1
  attack: 200
  defense: 300
`,zt=`# 《王立魔法図書館》 (Royal Magical Library)
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
`,Kt=`# 《召喚僧サモンプリースト》 (Summoner Monk)
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
  attribute: "DARK"
  race: "Spellcaster"
  level: 4
  attack: 800
  defense: 1600

effectChainableActions:
  triggers:
    - conditions:
        trigger:
          events: ["monsterSummoned"]
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
`,Qt=`# 《クリッター》 (Sangan)
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
`,Xt=`# 《黒き森のウィッチ》 (Witch of the Black Forest)
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
`,Jt=`# 《強欲な壺》 (Pot of Greed)
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
`,$t=`# 《成金ゴブリン》 (Upstart Goblin)
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
`,en=`# 《天使の施し》 (Graceful Charity)
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
`,tn=`# 《テラ・フォーミング》 (Terraforming)
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
`,nn=`# 《魔法石の採掘》 (Magical Stone Excavation)
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
`,sn=`# 《無の煉獄》 (Into the Void)
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
`,an=`# 《命削りの宝札》 (Card of Demise)
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
`,rn=`# 《闇の量産工場》 (Dark Factory of Mass Production)
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
`,on=`# 《一時休戦》 (One Day of Peace)
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
`,cn=`# 《トゥーンのもくじ》 (Toon Table of Contents)
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
`,ln=`# 《強欲で謙虚な壺》 (Pot of Duality)
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
`,dn=`# 《打ち出の小槌》 (Magical Mallet)
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
`,un=`# 《手札断殺》 (Hand Destruction)
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
`,fn=`# 《トゥーン・ワールド》 (Toon World)
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
`,pn=`# 《チキンレース》 (Chicken Game)
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
`,Ye=new Map([[70903634,Yt],[7902349,qt],[8124921,Zt],[44519536,Wt],[33396948,Ht],[70791313,zt],[423585,Kt],[26202165,Qt],[78010363,Xt],[55144522,Jt],[70368879,$t],[79571449,en],[73628505,tn],[98494543,nn],[93946239,sn],[59750328,an],[90928333,rn],[33782437,on],[89997728,cn],[98645731,ln],[85852291,dn],[74519184,un],[15259703,fn],[67616300,pn]]);class ge extends Error{constructor(e,t,n,i){const s=t?` (Card ID: ${t})`:"",o=n?` [Field: ${n}]`:"";super(`DSL Parse Error${s}${o}: ${e}`),this.cardId=t,this.field=n,this.cause=i,this.name="DSLParseError"}}class mn extends Error{constructor(e,t,n,i){super(`DSL Validation Error (Card ID: ${t}, Field: ${n}): ${e}`),this.cardId=t,this.field=n,this.issues=i,this.name="DSLValidationError"}}function qe(a){var s;let e;try{e=Pt.load(a)}catch(o){throw new ge(o instanceof Error?o.message:"Unknown YAML parse error",void 0,void 0,o instanceof Error?o:void 0)}if(e==null)throw new ge("YAML content is empty or null");if(typeof e!="object")throw new ge(`Expected object at root, got ${typeof e}`);const t=e,n=typeof t.id=="number"?t.id:void 0,i=kt.safeParse(e);if(!i.success){const o=i.error.issues.map(u=>`${u.path.join(".")}: ${u.message}`),c=((s=i.error.issues[0])==null?void 0:s.path.join("."))??"unknown";throw new mn(`Validation failed with ${i.error.issues.length} issue(s)`,n??0,c,o)}return i.data}class Sn{constructor(e,t,n=1){d(this,"cardId");d(this,"effectId");d(this,"effectCategory","trigger");d(this,"spellSpeed");this.cardId=e,this.spellSpeed=n,this.effectId=Ie.Id.create("trigger",e,t)}canActivate(e,t){const n=this.individualConditions(e,t);return n.isValid?r.Validation.success():n}createActivationSteps(e,t){return[Ee(t.id),...this.individualActivationSteps(e,t)]}createResolutionSteps(e,t){return[...this.individualResolutionSteps(e,t)]}}function hn(a){return a.effectCategory==="trigger"}class T{static registerActivation(e,t){const n=this.getOrCreateEntry(e);n.activation=t}static registerIgnition(e,t){this.getOrCreateEntry(e).ignitionEffects.push(t)}static registerTrigger(e,t){this.getOrCreateEntry(e).triggerEffects.push(t)}static getActivation(e){var t;return(t=this.effects.get(e))==null?void 0:t.activation}static getIgnitionEffects(e){var t;return((t=this.effects.get(e))==null?void 0:t.ignitionEffects)??[]}static hasIgnitionEffects(e){const t=this.effects.get(e);return t!==void 0&&t.ignitionEffects.length>0}static getTriggerEffects(e){var t;return((t=this.effects.get(e))==null?void 0:t.triggerEffects)??[]}static hasTriggerEffects(e){const t=this.effects.get(e);return t!==void 0&&t.triggerEffects.length>0}static collectTriggerSteps(e,t,n){const i=[],s=(o,c)=>{for(const u of o){if(c&&!f.Instance.isFaceUp(u))continue;const h=this.getTriggerEffects(u.id);for(const C of h){if(!hn(C)||!C.triggers.includes(t.type)||C.selfOnly&&t.sourceInstanceId!==u.instanceId||!C.canActivate(e,u).isValid||!C.isMandatory)continue;const de=C.createActivationSteps(e,u),z=C.createResolutionSteps(e,u);n({sourceInstanceId:u.instanceId,sourceCardId:u.id,effectId:C.effectId,spellSpeed:C.spellSpeed,resolutionSteps:z,isNegated:!1}),i.push(...de)}}};return s(e.space.hand,!1),s(e.space.mainMonsterZone,!0),s(e.space.spellTrapZone,!0),s(e.space.fieldZone,!0),s(e.space.graveyard,!1),s(e.space.banished,!1),i}static collectChainableActions(e,t,n=new Set){const i=[];for(const s of e.space.hand)n.has(s.instanceId)||(this.collectActivation(i,s,e,t),this.collectEffects(i,s,e,t));for(const s of e.space.mainMonsterZone)n.has(s.instanceId)||f.Instance.isFaceUp(s)&&this.collectEffects(i,s,e,t);for(const s of e.space.spellTrapZone)n.has(s.instanceId)||(f.Instance.isFaceDown(s)?this.collectActivation(i,s,e,t):this.collectEffects(i,s,e,t));for(const s of e.space.fieldZone)n.has(s.instanceId)||f.Instance.isFaceUp(s)&&this.collectEffects(i,s,e,t);for(const s of e.space.graveyard)n.has(s.instanceId)||this.collectEffects(i,s,e,t);for(const s of e.space.banished)n.has(s.instanceId)||this.collectEffects(i,s,e,t);return i}static collectActivation(e,t,n,i){const s=this.getActivation(t.id);s&&this.tryAddAction(e,t,s,n,i)}static collectEffects(e,t,n,i){for(const s of this.getIgnitionEffects(t.id))this.tryAddAction(e,t,s,n,i);for(const s of this.getTriggerEffects(t.id))this.tryAddAction(e,t,s,n,i)}static tryAddAction(e,t,n,i,s){if(n.spellSpeed<s)return;n.canActivate(i,t).isValid&&e.push({instance:t,action:n})}static clear(){this.effects.clear()}static getRegisteredCardIds(){return Array.from(this.effects.keys())}static getOrCreateEntry(e){let t=this.effects.get(e);return t||(t={ignitionEffects:[],triggerEffects:[]},this.effects.set(e,t)),t}}d(T,"effects",new Map);class oe{static register(e,t){const n=this.rules.get(e)||[];this.rules.set(e,[...n,t])}static get(e){return this.rules.get(e)||[]}static getByCategory(e,t){return this.get(e).filter(i=>i.category===t)}static collectActiveRules(e,t){const n=[],i=[...e.space.spellTrapZone,...e.space.fieldZone];for(const s of i){if(!f.Instance.isFaceUp(s))continue;const o=this.getByCategory(s.id,t);for(const c of o)c.canApply(e)&&n.push(c)}return n}static collectTriggerRules(e,t){var s;const n=[],i=[...e.space.mainMonsterZone,...e.space.spellTrapZone,...e.space.fieldZone];for(const o of i){if(!f.Instance.isFaceUp(o))continue;const c=this.getByCategory(o.id,"TriggerRule");for(const u of c)(s=u.triggers)!=null&&s.includes(t)&&n.push({rule:u,sourceInstance:o})}return n}static collectTriggerSteps(e,t){const n=this.collectTriggerRules(e,t.type),i=[];for(const{rule:s,sourceInstance:o}of n){if(!s.canApply(e)||!s.createTriggerSteps||s.selfOnly&&t.sourceInstanceId!==o.instanceId)continue;const c=s.createTriggerSteps(e,o);i.push(...c)}return i}static clear(){this.rules.clear()}static getRegisteredCardIds(){return Array.from(this.rules.keys())}}d(oe,"rules",new Map);function gn(a){return{id:`emit-spell-activated-${a.instanceId}`,summary:"魔法発動イベント",description:"魔法カード発動をトリガーシステムに通知",notificationLevel:"silent",action:e=>r.Result.success(e,void 0,[{type:"spellActivated",sourceCardId:a.id,sourceInstanceId:a.instanceId}])}}function Cn(a){return{id:`emit-monster-summoned-${a.instanceId}`,summary:"モンスター召喚イベント",description:"モンスター召喚をトリガーシステムに通知",notificationLevel:"silent",action:e=>r.Result.success(e,void 0,[{type:"monsterSummoned",sourceCardId:a.id,sourceInstanceId:a.instanceId}])}}class ce{constructor(e){d(this,"cardId");d(this,"effectId");d(this,"effectCategory","activation");this.cardId=e,this.effectId=Ie.Id.create("activation",e)}canActivate(e,t){const n=this.subTypeConditions(e,t);if(!n.isValid)return n;const i=this.individualConditions(e,t);return i.isValid?r.Validation.success():i}createActivationSteps(e,t){return[Ee(this.cardId),gn(t),...this.subTypePreActivationSteps(e,t),...this.individualActivationSteps(e,t),...this.subTypePostActivationSteps(e,t)]}createResolutionSteps(e,t){return[...this.subTypePreResolutionSteps(e,t),...this.individualResolutionSteps(e,t),...this.subTypePostResolutionSteps(e,t)]}}class Ze extends ce{constructor(){super(...arguments);d(this,"spellSpeed",1)}subTypeConditions(t,n){return l.Phase.isMain(t.phase)?r.Validation.success():r.Validation.failure(r.Validation.ERROR_CODES.NOT_MAIN_PHASE)}subTypePreActivationSteps(t,n){return[]}subTypePostActivationSteps(t){return[]}subTypePreResolutionSteps(t,n){return[]}subTypePostResolutionSteps(t,n){return[je(n.instanceId,n.jaName)]}static createNoOp(t){return new vn(t)}}class vn extends Ze{constructor(e){super(e)}individualConditions(){return r.Validation.success()}individualActivationSteps(){return[]}individualResolutionSteps(){return[]}}class In extends Ze{constructor(t,n){super(t);d(this,"dslDefinition");this.dslDefinition=n}buildSteps(t,n){if(!t||t.length===0)return[];const i={cardId:this.cardId,sourceInstanceId:n.instanceId};return t.map(s=>Z(s.step,s.args??{},i))}individualConditions(t,n){const i=this.dslDefinition.conditions;if(!i||!i.requirements||i.requirements.length===0)return r.Validation.success();for(const s of i.requirements){const o=ne(s.step,t,n,s.args??{});if(!o.isValid)return o}return r.Validation.success()}individualActivationSteps(t,n){return this.buildSteps(this.dslDefinition.activations,n)}individualResolutionSteps(t,n){return this.buildSteps(this.dslDefinition.resolutions,n)}}function En(a,e){return new In(a,e)}class We extends ce{constructor(){super(...arguments);d(this,"spellSpeed",2)}subTypeConditions(t,n){var i;return f.Instance.isFaceDown(n)&&((i=n.stateOnField)!=null&&i.placedThisTurn)?r.Validation.failure(r.Validation.ERROR_CODES.QUICK_PLAY_RESTRICTION):r.Validation.success()}subTypePreActivationSteps(t,n){return[]}subTypePostActivationSteps(t,n){return[]}subTypePreResolutionSteps(t,n){return[]}subTypePostResolutionSteps(t,n){return[je(n.instanceId,n.jaName)]}static createNoOp(t){return new Tn(t)}}class Tn extends We{constructor(e){super(e)}individualConditions(){return r.Validation.success()}individualActivationSteps(){return[]}individualResolutionSteps(){return[]}}class yn extends We{constructor(t,n){super(t);d(this,"dslDefinition");this.dslDefinition=n}buildSteps(t,n){if(!t||t.length===0)return[];const i={cardId:this.cardId,sourceInstanceId:n.instanceId};return t.map(s=>Z(s.step,s.args??{},i))}individualConditions(t,n){const i=this.dslDefinition.conditions;if(!i||!i.requirements||i.requirements.length===0)return r.Validation.success();for(const s of i.requirements){const o=ne(s.step,t,n,s.args??{});if(!o.isValid)return o}return r.Validation.success()}individualActivationSteps(t,n){return this.buildSteps(this.dslDefinition.activations,n)}individualResolutionSteps(t,n){return this.buildSteps(this.dslDefinition.resolutions,n)}}function Rn(a,e){return new yn(a,e)}class ze extends ce{constructor(){super(...arguments);d(this,"spellSpeed",1)}subTypeConditions(t,n){return l.Phase.isMain(t.phase)?r.Validation.success():r.Validation.failure(r.Validation.ERROR_CODES.NOT_MAIN_PHASE)}subTypePreActivationSteps(t,n){return[]}subTypePostActivationSteps(t,n){return[]}subTypePreResolutionSteps(t,n){return[]}subTypePostResolutionSteps(t,n){return[]}static createNoOp(t){return new An(t)}}class An extends ze{constructor(e){super(e)}individualConditions(){return r.Validation.success()}individualActivationSteps(){return[]}individualResolutionSteps(){return[]}}class _n extends ze{constructor(t,n){super(t);d(this,"dslDefinition");this.dslDefinition=n}buildSteps(t,n){if(!t||t.length===0)return[];const i={cardId:this.cardId,sourceInstanceId:n.instanceId};return t.map(s=>Z(s.step,s.args??{},i))}individualConditions(t,n){const i=this.dslDefinition.conditions;if(!i||!i.requirements||i.requirements.length===0)return r.Validation.success();for(const s of i.requirements){const o=ne(s.step,t,n,s.args??{});if(!o.isValid)return o}return r.Validation.success()}individualActivationSteps(t,n){return this.buildSteps(this.dslDefinition.activations,n)}individualResolutionSteps(t,n){return this.buildSteps(this.dslDefinition.resolutions,n)}}function On(a,e){return new _n(a,e)}class Nn{constructor(e,t){d(this,"cardId");d(this,"effectId");d(this,"effectCategory","ignition");d(this,"spellSpeed",1);this.cardId=e,this.effectId=Ie.Id.create("ignition",e,t)}canActivate(e,t){if(!l.Phase.isMain(e.phase))return r.Validation.failure(r.Validation.ERROR_CODES.NOT_MAIN_PHASE);const n=this.individualConditions(e,t);return n.isValid?r.Validation.success():n}createActivationSteps(e,t){return[Ee(t.id),...this.individualActivationSteps(e,t)]}createResolutionSteps(e,t){return[...this.individualResolutionSteps(e,t)]}}class Dn extends Nn{constructor(t,n,i){super(t,n);d(this,"dslDefinition");this.dslDefinition=i}buildSteps(t,n){if(!t||t.length===0)return[];const i={cardId:this.cardId,sourceInstanceId:n.instanceId};return t.map(s=>Z(s.step,s.args??{},i))}individualConditions(t,n){const i=this.dslDefinition.conditions;if(!i||!i.requirements||i.requirements.length===0)return r.Validation.success();for(const s of i.requirements){const o=ne(s.step,t,n,s.args??{});if(!o.isValid)return o}return r.Validation.success()}individualActivationSteps(t,n){return this.buildSteps(this.dslDefinition.activations,n)}individualResolutionSteps(t,n){return this.buildSteps(this.dslDefinition.resolutions,n)}}function bn(a,e,t){return new Dn(a,e,t)}class Vn extends Sn{constructor(t,n,i){var o;super(t,n,i.spellSpeed??1);d(this,"triggers");d(this,"triggerTiming");d(this,"isMandatory");d(this,"selfOnly");d(this,"dslDefinition");this.dslDefinition=i;const s=(o=i.conditions)==null?void 0:o.trigger;this.triggers=(s==null?void 0:s.events)??[],this.triggerTiming=(s==null?void 0:s.timing)??"if",this.isMandatory=(s==null?void 0:s.isMandatory)??!0,this.selfOnly=(s==null?void 0:s.selfOnly)??!1}buildSteps(t,n){if(!t||t.length===0)return[];const i={cardId:this.cardId,sourceInstanceId:n.instanceId};return t.map(s=>Z(s.step,s.args??{},i))}individualConditions(t,n){var s;const i=(s=this.dslDefinition.conditions)==null?void 0:s.requirements;if(!i||i.length===0)return r.Validation.success();for(const o of i){const c=ne(o.step,t,n,o.args??{});if(!c.isValid)return c}return r.Validation.success()}individualActivationSteps(t,n){return this.buildSteps(this.dslDefinition.activations,n)}individualResolutionSteps(t,n){return this.buildSteps(this.dslDefinition.resolutions,n)}}function Pn(a,e,t){return new Vn(a,e,t)}class kn{constructor(e){d(this,"cardId");d(this,"isEffect",!0);this.cardId=e}canApply(e){return this.isOnFieldFaceUp(e)?this.individualConditions(e):!1}isOnFieldFaceUp(e){return[...e.space.mainMonsterZone,...e.space.spellTrapZone,...e.space.fieldZone].some(n=>n.id===this.cardId&&f.Instance.isFaceUp(n))}}const Ln=new Map([]);function xn(a){const e=Ln.get(a);e&&e()}class wn extends kn{constructor(t,n){var s;super(t);d(this,"category");d(this,"triggers");d(this,"triggerTiming");d(this,"isMandatory");d(this,"selfOnly");d(this,"dslDefinition");this.dslDefinition=n,this.category=n.category;const i=(s=n.conditions)==null?void 0:s.trigger;this.triggers=(i==null?void 0:i.events)??[],this.triggerTiming=(i==null?void 0:i.timing)??"if",this.isMandatory=(i==null?void 0:i.isMandatory)??!0,this.selfOnly=(i==null?void 0:i.selfOnly)??!1}individualConditions(t){return!0}createTriggerSteps(t,n){const i=this.dslDefinition.resolutions??[],s={cardId:this.cardId,sourceInstanceId:n.instanceId};return i.map(o=>Z(o.step,o.args??{},s))}}class Ke extends ce{constructor(){super(...arguments);d(this,"spellSpeed",1)}subTypeConditions(t,n){return l.Phase.isMain(t.phase)?r.Validation.success():r.Validation.failure(r.Validation.ERROR_CODES.NOT_MAIN_PHASE)}subTypePreActivationSteps(t,n){return[]}subTypePostActivationSteps(t,n){return[]}subTypePreResolutionSteps(t,n){return[]}subTypePostResolutionSteps(t,n){return[]}static createNoOp(t){return new Fn(t)}}class Fn extends Ke{constructor(e){super(e)}individualConditions(){return r.Validation.success()}individualActivationSteps(){return[]}individualResolutionSteps(){return[]}}function Qe(a){const{id:e,data:t}=a;j.register(e,{jaName:t.jaName,type:t.type,frameType:t.frameType,spellType:t.spellType,trapType:t.trapType,edition:t.edition??"latest",level:t.level,attack:t.attack,defense:t.defense})}function Mn(a){const{id:e,data:t}=a,n=a.effectChainableActions;if(!n)return;const i=t.spellType;if(n.activations)if(i==="normal"){const s=En(e,n.activations);T.registerActivation(e,s)}else if(i==="quick-play"){const s=Rn(e,n.activations);T.registerActivation(e,s)}else if(i==="continuous"){const s=On(e,n.activations);T.registerActivation(e,s)}else throw new Error(`Unsupported spell type "${i}" for card ID ${e}`);else if(i==="field"){const s=Ke.createNoOp(e);T.registerActivation(e,s)}n.ignitions&&n.ignitions.forEach((s,o)=>{const c=bn(e,o+1,s);T.registerIgnition(e,c)}),n.triggers&&n.triggers.forEach((s,o)=>{const c=Pn(e,o+1,s);T.registerTrigger(e,c)})}function Gn(a){const{id:e}=a,t=a.effectAdditionalRules;if(t&&t.continuous)for(const n of t.continuous){const i=new wn(e,n);oe.register(e,i)}}function Un(a){const e=qe(a);Qe(e)}function jn(a){const e=qe(a);Qe(e),Mn(e),Gn(e)}const Bn=new Map([]);function Hn(a){const e=Bn.get(a);e&&e()}const Yn=(a,e,t)=>[e,()=>j.register(e,{jaName:t,type:"trap",frameType:"trap",trapType:a,edition:"latest"})],qn=new Map([Yn("normal",83968380,"強欲な瓶")]);function Xe(a){const e=qn.get(a);e&&e()}function Zn(a){j.clear();for(const e of a){const t=Ye.get(e);if(t){Un(t);continue}Xe(e)}}function Wn(a){j.clear(),T.clear(),oe.clear();for(const e of a){const t=Ye.get(e);if(t){jn(t);continue}Xe(e),Hn(e),xn(e)}}const zn=(a,e,t,n,i)=>({success:!0,updatedState:l.checkVictory(a),message:e,emittedEvents:t,activationSteps:n??[],chainBlock:i}),Kn=(a,e)=>({success:!1,updatedState:a,error:e,activationSteps:[]}),b={Result:{success:zn,failure:Kn}};class Qn{constructor(){d(this,"description");this.description="Advance to next phase"}canExecute(e){if(e.result.isGameOver)return r.Validation.failure(r.Validation.ERROR_CODES.GAME_OVER);const t=l.Phase.next(e.phase);return l.Phase.changeable(e.phase,t).valid?r.Validation.success():r.Validation.failure(r.Validation.ERROR_CODES.PHASE_TRANSITION_NOT_ALLOWED)}execute(e){const t=this.canExecute(e);if(!t.isValid)return b.Result.failure(e,r.Validation.errorMessage(t));const n=l.Phase.next(e.phase),i=l.Phase.isEnd(n)&&e.queuedEndPhaseEffectIds.length>0,s=l.Phase.isEnd(n)?this.resetFieldCardActivatedEffects(e.space):e.space,o={...e,space:s,phase:n,activatedCardIds:l.Phase.isEnd(n)?new Set:e.activatedCardIds,queuedEndPhaseEffectIds:i?[]:e.queuedEndPhaseEffectIds};return b.Result.success(o,`${l.Phase.displayName(n)} です`)}getNextPhase(e){return l.Phase.next(e.phase)}resetFieldCardActivatedEffects(e){const t=n=>{if(!n.stateOnField||n.stateOnField.activatedEffects.size===0)return n;const i={...n.stateOnField,activatedEffects:new Set};return{...n,stateOnField:i}};return{...e,mainMonsterZone:e.mainMonsterZone.map(t),spellTrapZone:e.spellTrapZone.map(t),fieldZone:e.fieldZone.map(t)}}}function Je(a){return l.Phase.isMain(a.phase)?l.Space.isMainMonsterZoneFull(a.space)?r.Validation.failure(r.Validation.ERROR_CODES.MONSTER_ZONE_FULL):a.normalSummonUsed>=a.normalSummonLimit?r.Validation.failure(r.Validation.ERROR_CODES.SUMMON_LIMIT_REACHED):r.Validation.success():r.Validation.failure(r.Validation.ERROR_CODES.NOT_MAIN_PHASE)}function $e(a,e,t){const n=l.Space.findCard(a.space,e),i=l.Space.moveCard(a.space,n,"mainMonsterZone",{position:t==="attack"?"faceUp":"faceDown",battlePosition:t});return{...a,space:i,normalSummonUsed:a.normalSummonUsed+1}}class ke{constructor(e){d(this,"description");this.cardInstanceId=e,this.description=`Summon monster ${e}`}canExecute(e){if(e.result.isGameOver)return r.Validation.failure(r.Validation.ERROR_CODES.GAME_OVER);const t=Je(e);if(!t.isValid)return t;const n=l.Space.findCard(e.space,this.cardInstanceId);return n?f.isMonster(n)?f.Instance.inHand(n)?r.Validation.success():r.Validation.failure(r.Validation.ERROR_CODES.CARD_NOT_IN_HAND):r.Validation.failure(r.Validation.ERROR_CODES.NOT_MONSTER_CARD):r.Validation.failure(r.Validation.ERROR_CODES.CARD_NOT_FOUND)}execute(e){const t=this.canExecute(e);if(!t.isValid)return b.Result.failure(e,r.Validation.errorMessage(t));const n=l.Space.findCard(e.space,this.cardInstanceId),i=$e(e,this.cardInstanceId,"attack"),s=l.Space.findCard(i.space,this.cardInstanceId),o=[Cn(s)];return b.Result.success(i,`${f.nameWithBrackets(n)}を召喚します`,void 0,o)}getCardInstanceId(){return this.cardInstanceId}}class Le{constructor(e){d(this,"description");this.cardInstanceId=e,this.description=`Set monster ${e}`}canExecute(e){if(e.result.isGameOver)return r.Validation.failure(r.Validation.ERROR_CODES.GAME_OVER);const t=Je(e);if(!t.isValid)return t;const n=l.Space.findCard(e.space,this.cardInstanceId);return n?f.isMonster(n)?f.Instance.inHand(n)?r.Validation.success():r.Validation.failure(r.Validation.ERROR_CODES.CARD_NOT_IN_HAND):r.Validation.failure(r.Validation.ERROR_CODES.NOT_MONSTER_CARD):r.Validation.failure(r.Validation.ERROR_CODES.CARD_NOT_FOUND)}execute(e){const t=this.canExecute(e);if(!t.isValid)return b.Result.failure(e,r.Validation.errorMessage(t));const n=l.Space.findCard(e.space,this.cardInstanceId),i=$e(e,this.cardInstanceId,"defense");return b.Result.success(i,`${f.nameWithBrackets(n)}をセットします`)}getCardInstanceId(){return this.cardInstanceId}}class xe{constructor(e){d(this,"description");this.cardInstanceId=e,this.description=`Set spell/trap ${e}`}canExecute(e){if(e.result.isGameOver)return r.Validation.failure(r.Validation.ERROR_CODES.GAME_OVER);if(!l.Phase.isMain(e.phase))return r.Validation.failure(r.Validation.ERROR_CODES.NOT_MAIN_PHASE);const t=l.Space.findCard(e.space,this.cardInstanceId);return t?!f.isSpell(t)&&!f.isTrap(t)?r.Validation.failure(r.Validation.ERROR_CODES.NOT_SPELL_OR_TRAP_CARD):f.Instance.inHand(t)?!f.isFieldSpell(t)&&l.Space.isSpellTrapZoneFull(e.space)?r.Validation.failure(r.Validation.ERROR_CODES.SPELL_TRAP_ZONE_FULL):r.Validation.success():r.Validation.failure(r.Validation.ERROR_CODES.CARD_NOT_IN_HAND):r.Validation.failure(r.Validation.ERROR_CODES.CARD_NOT_FOUND)}execute(e){const t=this.canExecute(e);if(!t.isValid)return b.Result.failure(e,r.Validation.errorMessage(t));const n=l.Space.findCard(e.space,this.cardInstanceId),i={...e,space:this.moveSetSpellTrapCard(e.space,n)};return b.Result.success(i,`${f.nameWithBrackets(n)}をセットします`)}moveSetSpellTrapCard(e,t){if(f.isFieldSpell(t)){const n=l.Space.sendExistingFieldSpellToGraveyard(e);return l.Space.moveCard(n,t,"fieldZone",{position:"faceDown"})}return l.Space.moveCard(e,t,"spellTrapZone",{position:"faceDown"})}getCardInstanceId(){return this.cardInstanceId}}function et(a,e){if(f.Instance.inHand(e)){if(f.isFieldSpell(e)){const t=l.Space.sendExistingFieldSpellToGraveyard(a);return l.Space.moveCard(t,e,"fieldZone",{position:"faceUp"})}if(f.isSpell(e)||f.isTrap(e))return l.Space.moveCard(a,e,"spellTrapZone",{position:"faceUp"});throw new Error("Invalid card type for activation")}return l.Space.updateCardStateInPlace(a,e,{position:"faceUp"})}class we{constructor(e){d(this,"description");this.cardInstanceId=e,this.description=`Activate spell card ${e}`}canExecute(e){if(e.result.isGameOver)return r.Validation.failure(r.Validation.ERROR_CODES.GAME_OVER);const t=l.Space.findCard(e.space,this.cardInstanceId);if(!t)return r.Validation.failure(r.Validation.ERROR_CODES.CARD_NOT_FOUND);if(!f.isSpell(t))return r.Validation.failure(r.Validation.ERROR_CODES.NOT_SPELL_CARD);if(!f.Instance.inHand(t)&&!(f.Instance.onField(t)&&f.Instance.isFaceDown(t)))return r.Validation.failure(r.Validation.ERROR_CODES.CARD_NOT_IN_VALID_LOCATION);if(!f.isFieldSpell(t)&&l.Space.isSpellTrapZoneFull(e.space))return r.Validation.failure(r.Validation.ERROR_CODES.SPELL_TRAP_ZONE_FULL);const n=T.getActivation(t.id);if(!n)return r.Validation.failure(r.Validation.ERROR_CODES.EFFECT_NOT_REGISTERED);const i=n.canActivate(e,t);return i.isValid?r.Validation.success():i}execute(e){const t=this.canExecute(e);if(!t.isValid)return b.Result.failure(e,r.Validation.errorMessage(t));const n=l.Space.findCard(e.space,this.cardInstanceId),i={...e,space:et(e.space,n),activatedCardIds:l.updatedActivatedCardIds(e.activatedCardIds,n.id)},s=T.getActivation(n.id),o=(s==null?void 0:s.createActivationSteps(i,n))??[],c=(s==null?void 0:s.createResolutionSteps(i,n))??[],u=s?{effectId:s.effectId,sourceInstanceId:n.instanceId,sourceCardId:n.id,spellSpeed:s.spellSpeed,resolutionSteps:c,isNegated:!1}:void 0;return b.Result.success(i,void 0,[],o,u)}getCardInstanceId(){return this.cardInstanceId}}class Fe{constructor(e){d(this,"description");this.cardInstanceId=e,this.description=`Activate ignition effect of ${e}`}canExecute(e){if(e.result.isGameOver)return r.Validation.failure(r.Validation.ERROR_CODES.GAME_OVER);const t=l.Space.findCard(e.space,this.cardInstanceId);if(!t)return r.Validation.failure(r.Validation.ERROR_CODES.CARD_NOT_FOUND);if(!["fieldZone","spellTrapZone","mainMonsterZone"].includes(t.location))return r.Validation.failure(r.Validation.ERROR_CODES.CARD_NOT_ON_FIELD);if(!f.Instance.isFaceUp(t))return r.Validation.failure(r.Validation.ERROR_CODES.CARD_NOT_FACE_UP);const i=T.getIgnitionEffects(t.id);return i.length===0?r.Validation.failure(r.Validation.ERROR_CODES.NO_IGNITION_EFFECT):this.findActivatableEffect(i,e,t)?r.Validation.success():r.Validation.failure(r.Validation.ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET)}findActivatableEffect(e,t,n){return e.find(i=>i.canActivate(t,n).isValid)}execute(e){const t=this.canExecute(e);if(!t.isValid)return b.Result.failure(e,r.Validation.errorMessage(t));const n=l.Space.findCard(e.space,this.cardInstanceId),i=T.getIgnitionEffects(n.id),s=this.findActivatableEffect(i,e,n),o=n.stateOnField,c=new Set(o.activatedEffects);c.add(s.effectId);const u={...e,space:l.Space.updateCardStateInPlace(e.space,n,{activatedEffects:c})},h=s.createActivationSteps(u,n),C=s.createResolutionSteps(u,n),x={effectId:s.effectId,sourceInstanceId:n.instanceId,sourceCardId:n.id,spellSpeed:s.spellSpeed,resolutionSteps:C,isNegated:!1};return b.Result.success(u,void 0,[],h,x)}getCardInstanceId(){return this.cardInstanceId}}function tt(){return l.initialize({mainDeckCardIds:[],extraDeckCardIds:[]},j.getCard,{skipShuffle:!0,skipInitialDraw:!0})}const w=re(tt());function Xn(a){const e=[];a.mainDeck.forEach(n=>{for(let i=0;i<n.quantity;i++)e.push(n.id)});const t=[];return a.extraDeck.forEach(n=>{for(let i=0;i<n.quantity;i++)t.push(n.id)}),{mainDeckCardIds:e,extraDeckCardIds:t}}function Jn(a){const e=Xn(a);w.set(l.initialize(e,j.getCard))}function $(){let a=tt();return w.subscribe(t=>{a=t})(),a}function Me(){return{isBuilding:!1,stack:[],currentChainNumber:0,lastSpellSpeed:null}}function $n(){const{subscribe:a,update:e,set:t}=re(Me()),n={subscribe:a,startChain:()=>{e(i=>({...i,isBuilding:!0,currentChainNumber:1}))},pushChainBlock:i=>{e(s=>{const o={...i,chainNumber:s.currentChainNumber};return{...s,stack:[...s.stack,o],currentChainNumber:s.currentChainNumber+1,lastSpellSpeed:i.spellSpeed}})},endChainBuilding:()=>{e(i=>({...i,isBuilding:!1}))},popChainBlock:()=>{const i=m(n);if(i.stack.length===0)return;const s=i.stack[i.stack.length-1];return e(o=>({...o,stack:o.stack.slice(0,-1)})),s},canChain:i=>{const s=m(n);return s.isBuilding?i>=(s.lastSpellSpeed??1):i>=1},isEmpty:()=>m(n).stack.length===0,isBuilding:()=>m(n).isBuilding,getStackSize:()=>m(n).stack.length,getState:()=>m(n),getStackedInstanceIds:()=>{const i=m(n);return new Set(i.stack.map(s=>s.sourceInstanceId))},getRequiredSpellSpeed:()=>{const i=m(n);return i.stack.length===0?1:Math.max(2,i.lastSpellSpeed??2)},reset:()=>{t(Me())}};return n}const y=$n();function le(a,e,t){const n=a.action(e,t);return n.success?(w.set(n.updatedState),{updatedState:n.updatedState,emittedEvents:n.emittedEvents||[]}):{updatedState:e,emittedEvents:[]}}function ei(a,e,t,n){const i=[];for(const s of a){const o=oe.collectTriggerSteps(e,s);i.push(...o);const c=T.collectTriggerSteps(e,s,u=>{y.pushChainBlock(u)});i.push(...c)}return i.length===0?t:[...t.slice(0,n+1),...i,...t.slice(n+1)]}function Ge(a,e){const t=a.currentIndex+1;return t<a.steps.length?(e(n=>({...n,currentIndex:t,currentStep:n.steps[t]})),!0):(ve(e),!1)}function ve(a){if(a(e=>({...e,isActive:!1,currentStep:null,steps:[],currentIndex:-1})),y.isEmpty())y.reset();else if(y.isBuilding()){const e=m(w),t=y.getRequiredSpellSpeed(),n=y.getStackedInstanceIds(),i=T.collectChainableActions(e,t,n);if(i.length>0){a(s=>({...s,chainConfirmationConfig:{chainableCards:i,onActivate:o=>{const c=i.find(u=>u.instance.instanceId===o);c&&v.activateChain(c.instance,c.action)},onPass:()=>{a(o=>({...o,chainConfirmationConfig:null})),v.resolveChain()}}}));return}setTimeout(()=>{v.resolveChain()},0)}else setTimeout(()=>{v.continueChainResolution()},0)}const ti=async(a,e)=>({shouldContinue:!0,emittedEvents:le(a,e).emittedEvents}),ni=async(a,e,t)=>{const n=le(a,e);return t.notification&&t.notification.showInfo(a.summary,a.description),{shouldContinue:!0,delay:300,emittedEvents:n.emittedEvents}},ii=async(a,e,t,n)=>{const i=a.cardSelectionConfig;let s;if(i.availableCards!==null)s=i.availableCards;else{if(!i._sourceZone)return console.error("_sourceZone must be specified when availableCards is null"),{shouldContinue:!1};const c=e.space[i._sourceZone];s=i._filter?c.filter((u,h)=>i._filter(u,h)):c}let o=[];return await new Promise(c=>{n(u=>({...u,cardSelectionConfig:{availableCards:s,minCards:i.minCards,maxCards:i.maxCards,summary:i.summary,description:i.description,cancelable:i.cancelable,onConfirm:h=>{o=le(a,e,h).emittedEvents,n(x=>({...x,cardSelectionConfig:null})),c()},onCancel:()=>{n(h=>({...h,cardSelectionConfig:null})),c()}}}))}),{shouldContinue:!0,emittedEvents:o}},si=async(a,e,t,n)=>{let i=[];return await new Promise(s=>{n(o=>({...o,confirmationConfig:{summary:a.summary,description:a.description,onConfirm:()=>{i=le(a,e).emittedEvents,n(u=>({...u,confirmationConfig:null})),s()}}}))}),{shouldContinue:!0,emittedEvents:i}};function ai(a){const e=a.notificationLevel||"info";return e==="silent"?ti:e==="info"?ni:a.cardSelectionConfig?ii:si}function ri(){const{subscribe:a,update:e}=re({isActive:!1,currentStep:null,steps:[],currentIndex:-1,notificationHandler:null,confirmationConfig:null,cardSelectionConfig:null,chainConfirmationConfig:null,eventTimeline:r.TimeLine.createEmptyTimeline()});return{subscribe:a,registerNotificationHandler:t=>{e(n=>({...n,notificationHandler:t}))},startProcessing:t=>{e(i=>({...i,isActive:!0,steps:t,currentIndex:0,currentStep:t[0]||null}));const n=t[0];if(n){const i=n.notificationLevel||"info";(i==="info"||i==="silent")&&v.confirmCurrentStep()}},confirmCurrentStep:async()=>{let t=m(v);if(!t.currentStep)return;if(Lt(t.currentStep)){e(c=>({...c,eventTimeline:r.TimeLine.advanceTime(c.eventTimeline)})),Ge(t,e)&&v.confirmCurrentStep();return}const n=m(w),s=await ai(t.currentStep)(t.currentStep,n,{notification:t.notificationHandler},e);if(s.emittedEvents&&s.emittedEvents.length>0){let o=t.eventTimeline;for(const h of s.emittedEvents)o=r.TimeLine.recordEvent(o,h);const c=m(w),u=ei(s.emittedEvents,c,t.steps,t.currentIndex);e(h=>({...h,steps:u,eventTimeline:o})),t=m(v)}s.delay&&await new Promise(o=>setTimeout(o,s.delay)),s.shouldContinue?Ge(t,e)&&v.confirmCurrentStep():ve(e)},activateChain:(t,n)=>{e(u=>({...u,chainConfirmationConfig:null}));const i=m(w),s={...i,space:et(i.space,t),activatedCardIds:l.updatedActivatedCardIds(i.activatedCardIds,t.id)};w.set(s);const o=n.createActivationSteps(s,t),c=n.createResolutionSteps(s,t);y.pushChainBlock({sourceInstanceId:t.instanceId,sourceCardId:t.id,effectId:n.effectId,spellSpeed:n.spellSpeed,resolutionSteps:c,isNegated:!1}),o.length>0?v.startProcessing(o):ve(e)},resolveChain:()=>{y.endChainBuilding(),v.continueChainResolution()},continueChainResolution:()=>{const t=y.popChainBlock();if(!t){y.reset();return}!t.isNegated&&t.resolutionSteps.length>0?(e(n=>({...n,isActive:!0,steps:t.resolutionSteps,currentIndex:0,currentStep:t.resolutionSteps[0]||null})),v.confirmCurrentStep()):v.continueChainResolution()},cancelProcessing:()=>{e(t=>({...t,isActive:!1,currentStep:null,steps:[],currentIndex:-1}))},reset:()=>{e(t=>({...t,isActive:!1,currentStep:null,steps:[],currentIndex:-1}))}}}const v=ri();class oi{canExecuteCommand(e,...t){const n=$();return new e(...t).canExecute(n).isValid}executeCommand(e,...t){const n=$(),s=new e(...t).execute(n);return s.success&&(w.set(s.updatedState),s.chainBlock&&(y.getStackSize()===0&&y.startChain(),y.pushChainBlock(s.chainBlock)),s.activationSteps&&s.activationSteps.length>0?v.startProcessing(s.activationSteps):s.chainBlock&&v.resolveChain()),{success:s.success,message:s.message,error:s.error}}loadDeck(e){const t=Ne(e),n=De(t);return Zn(n),{deckData:be(t,n),uniqueCardIds:n}}initializeGame(e){const t=Ne(e),n=De(t);Wn(n);const i=be(t,n);return this.startGame(t),{deckData:i,uniqueCardIds:n}}startGame(e){Jn(e)}getGameState(){return $()}findCardOnField(e){const t=$();return[...t.space.mainMonsterZone,...t.space.spellTrapZone,...t.space.fieldZone].find(i=>i.instanceId===e)}advancePhase(){return this.executeCommand(Qn)}async autoAdvanceToMainPhase(e,t){const n=$();if(n.turn!==1||n.phase!=="draw")return!1;for(let i=0;i<2;i++){e&&await e();const s=this.advancePhase();if(s.success)s.message&&t&&t(s.message);else return console.error(`[GameFacade] Auto advance failed: ${s.error}`),!1}return!0}canSummonMonster(e){return this.canExecuteCommand(ke,e)}summonMonster(e){return this.executeCommand(ke,e)}canSetMonster(e){return this.canExecuteCommand(Le,e)}setMonster(e){return this.executeCommand(Le,e)}canSetSpellTrap(e){return this.canExecuteCommand(xe,e)}setSpellTrap(e){return this.executeCommand(xe,e)}canActivateSpell(e){return this.canExecuteCommand(we,e)}activateSpell(e){return this.executeCommand(we,e)}canActivateIgnitionEffect(e){return this.canExecuteCommand(Fe,e)}activateIgnitionEffect(e){return this.executeCommand(Fe,e)}}const ts=new oi;function ci(){return{credentials:"same-origin"}}async function li(a,e,t){try{return await a(e,t)}catch(n){throw console.error("API error:",n),new Error(`Failed to fetch: ${t.method} ${e}`)}}const di=W({id:ee(),image_url:p(),image_url_small:p(),image_url_cropped:p()}),ui=W({set_name:p(),set_code:p(),set_rarity:p(),set_rarity_code:p(),set_price:p()}),fi=W({cardmarket_price:p(),tcgplayer_price:p(),ebay_price:p(),amazon_price:p(),coolstuffinc_price:p()}),pi=W({ban_tcg:p().optional(),ban_ocg:p().optional(),ban_goat:p().optional()}),mi=W({id:ee(),name:p(),type:p(),humanReadableCardType:p(),frameType:p(),desc:p(),race:p(),ygoprodeck_url:p(),archetype:p().optional(),typeline:te(p()).optional(),atk:ee().optional(),def:ee().optional(),level:ee().optional(),attribute:p().optional(),banlist_info:pi.optional(),card_images:te(di),card_sets:te(ui).optional(),card_prices:te(fi).optional()}),Si=W({data:te(mi)});function nt(a){const e=a.card_images[0];return{id:a.id,name:a.name,type:a.type,frameType:a.frameType,desc:a.desc,archetype:a.archetype,atk:a.atk,def:a.def,level:a.level,attribute:a.attribute,race:a.type.toLowerCase().includes("monster")?a.race:void 0,images:e?{image:e.image_url,imageSmall:e.image_url_small,imageCropped:e.image_url_cropped}:null}}const hi="https://db.ygoprodeck.com/api/v7",it="cardinfo.php",Ue=new Map;async function st(a,e){const n={...ci(),method:"GET"},i=`${hi}/${e}`;try{const s=await li(a,i,n);if(!s.ok){if(console.error(`YGOPRODeck API Error: ${s.status} ${s.statusText} - ${i}`),s.status===429)throw new Error("YGOPRODeck API rate limit exceeded. Please reduce request frequency.");return null}const o=await s.json();return Si.parse(o)}catch(s){throw s instanceof xt?console.error("YGOPRODeck API response validation failed:",s.issues):console.error("YGOPRODeck API fetch failed:",s),s}}async function gi(a,e){const t=`${it}?id=${e}`,n=await st(a,t),i=n==null?void 0:n.data[0];return i?nt(i):null}async function Ci(a,e){if(e.length===0)return[];const t=[],n=[];for(const s of e){const o=Ue.get(s);o?t.push(o):n.push(s)}let i=[];if(n.length>0){const s=n.join(","),o=`${it}?id=${s}`,c=await st(a,o);if(c!=null&&c.data){i=c.data;for(const u of i)Ue.set(u.id,u)}}return[...t,...i].map(nt)}class vi{async getCardsByIds(e,t){return Ci(e,t)}async getCardById(e,t){const n=await gi(e,t);if(!n)throw new Error(`Card not found: ID ${t}`);return n}}let Ce=null;function Ii(){return Ce||(Ce=new vi),Ce}function Ei(a){const e=a.toLowerCase();return e.includes("monster")?"monster":e.includes("spell")?"spell":e.includes("trap")?"trap":null}function Ti(a){return a.toLowerCase()}function yi(a,e){const t=`${e.jaName} (ID: ${e.id})`,n=Ei(a.type);n&&n!==e.type&&console.warn(`[CardData Mismatch] ${t}: type が一致しません。Domain="${e.type}", API="${n}" (raw: "${a.type}")`);const i=Ti(a.frameType);i!==e.frameType&&console.warn(`[CardData Mismatch] ${t}: frameType が一致しません。Domain="${e.frameType}", API="${i}" (raw: "${a.frameType}")`)}function Ri(a,e){yi(a,e);const t=e.type==="monster"&&a.atk!==void 0&&a.def!==void 0&&a.level!==void 0?{attack:a.atk,defense:a.def,level:a.level,attribute:a.attribute??"",race:a.race??""}:void 0;return{id:e.id,name:a.name,jaName:e.jaName,type:e.type,description:a.desc,frameType:e.frameType,edition:e.edition,archetype:a.archetype,monsterAttributes:t,images:a.images??void 0}}function Ai(a){const e=j.get(a.id);return Ri(a,e)}function _i(a){return a.map(e=>Ai(e))}const Oi={isInitialized:!1,isLoading:!1,error:null,data:new Map},L=re(Oi),Ni=Ii();async function ns(a){const e=m(L);if(!(e.isInitialized&&a.every(t=>e.data.has(t)))){L.update(t=>({...t,isLoading:!0,error:null}));try{const t=a.filter(n=>!e.data.has(n));if(t.length>0){const n=await Ni.getCardsByIds(fetch,t),i=_i(n);L.update(s=>{const o=new Map(s.data);return i.forEach(c=>{o.set(c.id,c)}),{...s,isInitialized:!0,isLoading:!1,data:o}})}else L.update(n=>({...n,isInitialized:!0,isLoading:!1}))}catch(t){const n=t instanceof Error?t.message:"Failed to initialize display card data cache";throw console.error("[displayCardDataCache] Initialization error:",t),L.update(i=>({...i,isLoading:!1,error:n})),t}}}function is(a){return m(L).data.get(a)}const ss={subscribe:L.subscribe,get isInitialized(){return m(L).isInitialized},get isLoading(){return m(L).isLoading},get error(){return m(L).error}},Di={small:"w-16 h-24",medium:"w-22 h-32",large:"w-32 h-48"},bi={small:"w-4 h-4 text-xs",medium:"w-6 h-6 text-xs",large:"w-8 h-8 text-sm"},Vi=""+new URL("../assets/CardBack.DGn8cQOG.jpg",import.meta.url).href;var Pi=R('<div class="w-full h-full flex items-center justify-center p-1"><img alt="裏向きカード" class="w-full h-full object-cover rounded-sm"/></div>'),ki=R('<img class="w-full h-full object-cover rounded-sm"/>'),Li=R('<span class="text-xs opacity-75 select-none mt-1"> </span>'),xi=R('<div class="w-full h-full bg-surface-200-700-token rounded-sm flex flex-col items-center justify-center text-center overflow-hidden"><img class="w-full h-full object-cover opacity-30"/> <div class="absolute inset-0 flex flex-col items-center justify-center"><span class="text-xs select-none text-surface-600-300-token font-medium"> </span> <!></div></div>'),wi=R('<div class="w-full h-full bg-surface-200-700-token rounded-sm flex items-center justify-center"><img alt="" class="w-full h-full object-cover opacity-20"/> <div class="absolute inset-0 flex items-center justify-center"><span class="text-xs opacity-50 select-none">No Image</span></div></div>'),Fi=R('<div class="px-1 py-1 bg-surface-50-900-token border-t border-surface-300"><div class="text-xs font-medium truncate"> </div></div>'),Mi=R('<div class="flex-1 flex items-center justify-center p-1"><!></div> <!>',1),Gi=R('<div class="absolute top-1 right-1 w-3 h-3 bg-primary-500 rounded-full animate-pulse"></div>'),Ui=R('<div class="absolute inset-0 bg-primary-500 opacity-10 pointer-events-none"></div>'),ji=R("<!> <!> <!>",1),Bi=R("<button><!></button>"),Hi=R("<div><!></div>");function as(a,e){Be(e,!0);const t=g=>{var A=ji(),B=he(A);{var K=I=>{var V=Pi(),Q=O(V);N(V),U(()=>q(Q,"src",fe)),E(I,V)},gt=I=>{var V=Mi(),Q=he(V),Et=O(Q);{var Tt=P=>{var _=ki();U(()=>{q(_,"src",e.card.images.imageCropped),q(_,"alt",e.card.jaName||"カード")}),E(P,_)},yt=(P,_)=>{{var M=H=>{var G=xi(),X=O(G),Oe=J(X,2),me=O(Oe),_t=O(me,!0);N(me);var Ot=J(me,2);{var Nt=Se=>{var Y=Li(),Dt=O(Y,!0);N(Y),U(()=>ae(Dt,e.card.type)),E(Se,Y)};F(Ot,Se=>{var Y;(Y=e.card)!=null&&Y.type&&Se(Nt)})}N(Oe),N(G),U(()=>{q(X,"src",fe),q(X,"alt",u()),ae(_t,u())}),E(H,G)},pe=H=>{var G=wi(),X=O(G);Mt(2),N(G),U(()=>q(X,"src",fe)),E(H,G)};F(P,H=>{S(Te)?H(M):H(pe,!1)},_)}};F(Et,P=>{var _,M;(M=(_=e.card)==null?void 0:_.images)!=null&&M.imageCropped?P(Tt):P(yt,!1)})}N(Q);var Rt=J(Q,2);{var At=P=>{var _=Fi(),M=O(_),pe=O(M,!0);N(M),N(_),U(()=>ae(pe,e.card.jaName)),E(P,_)};F(Rt,P=>{e.card&&!S(Te)&&P(At)})}E(I,V)};F(B,I=>{de()?I(K):I(gt,!1)})}var _e=J(B,2);{var Ct=I=>{var V=Gi();E(I,V)};F(_e,I=>{S(ue)&&I(Ct)})}var vt=J(_e,2);{var It=I=>{var V=Ui();E(I,V)};F(vt,I=>{C()&&(S(z)||S(ue))&&I(It)})}E(g,A)};let n=D(e,"size",3,"medium"),i=D(e,"clickable",3,!1),s=D(e,"selectable",3,!1),o=D(e,"isSelected",3,!1),c=D(e,"placeholder",3,!1),u=D(e,"placeholderText",3,"カード"),h=D(e,"rotation",3,0),C=D(e,"animate",3,!0),x=D(e,"showDetailOnClick",3,!1),de=D(e,"faceDown",3,!1),z=Ve(!1),ie=Ve(!1),ue=k(()=>s()?S(ie):o());Ft(()=>{s()||se(ie,o())});function at(){var g;console.log(`[Card] クリックイベント発生: clickable=${i()}, card=${(g=e.card)==null?void 0:g.jaName}, hasOnClick=${!!e.onClick}`),i()&&e.card&&e.onClick&&(console.log(`[Card] onClickコールバックを実行します: ${e.card.jaName}`),e.onClick(e.card)),s()&&se(ie,!S(ie)),x()&&e.card&&Bt(e.card)}function rt(){se(z,!0),e.onHover&&e.card&&e.onHover(e.card)}function ot(){se(z,!1),e.onHover&&e.onHover(null)}const Te=k(()=>c()||!e.card),fe=Vi,ct=k(()=>C()?"transition-all duration-300 ease-in-out":""),lt=k(()=>i()||s()||x()?"cursor-pointer hover:scale-105 hover:shadow-lg":""),dt=k(()=>S(ue)?"ring-2 ring-primary-500 shadow-lg":""),ut=k(()=>h()!==0?`transform: rotate(${h()}deg);`:""),ft=k(()=>{var g;return Ut((g=e.card)==null?void 0:g.frameType)}),pt=k(()=>{var g;return jt((g=e.card)==null?void 0:g.edition)}),ye=k(()=>()=>`
      ${Di[n()]}
      ${S(ct)}
      ${S(lt)}
      ${S(dt)}
      ${S(ft)}
      ${S(pt)}
      border rounded aspect-[3/4] flex flex-col justify-between
      relative overflow-hidden
    `),Re=k(()=>({style:S(ut),onclick:i()||s()||x()?at:void 0,onmouseenter:rt,onmouseleave:ot}));var Ae=wt(),mt=he(Ae);{var St=g=>{var A=Bi();Pe(A,K=>({class:`${K??""} bg-transparent p-0 border border-2 border-gray-100`,...S(Re)}),[()=>S(ye)()]);var B=O(A);t(B),N(A),E(g,A)},ht=g=>{var A=Hi();Pe(A,K=>({class:K,role:"img",...S(Re)}),[()=>S(ye)()]);var B=O(A);t(B),N(A),E(g,A)};F(mt,g=>{i()||s()||x()?g(St):g(ht,!1)})}E(a,Ae),He()}var Yi=R("<div> </div>");function rs(a,e){Be(e,!0);let t=D(e,"size",3,"medium"),n=D(e,"colorClasses",3,"bg-primary-200 text-primary-900");var i=Yi(),s=O(i,!0);N(i),U(()=>{Gt(i,1,`absolute -top-2 -right-2 ${bi[t()]??""} ${n()??""} rounded-full flex items-center justify-center font-bold shadow-md z-10`),ae(s,e.count)}),E(a,i),He()}export{as as C,is as a,rs as b,w as c,ss as d,Di as e,Vi as f,ts as g,v as h,ns as i};
