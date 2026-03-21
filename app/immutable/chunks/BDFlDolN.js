var Pn=Object.defineProperty;var xn=(a,e,n)=>e in a?Pn(a,e,{enumerable:!0,configurable:!0,writable:!0,value:n}):a[e]=n;var d=(a,e,n)=>xn(a,typeof e!="symbol"?e+"":e,n);import{E as ye,G as r,n as Ae,C as m,e as kn,b as f,s as He,c as Mn,d as wn,f as Be,h as Z,i as ee,j as Fn,D as Ce,k as Gn,l as Un,m as z,o as Yn,p as jn,q as qn,r as Pe,t as xe,u as ke,v as ne,w as g,x as ae,y as re,z as Hn}from"./BU1AcsiB.js";import{w as ue,g as T}from"./CU-LehAA.js";import{c as Bn,a as O,f as R}from"./CsM36qnd.js";import{l as We,am as Wn,t as ce,aq as Me,m as Ie,n as Ze,w as I,ar as F,z as N,B as D,y as J,x as j,ay as Zn}from"./X3kpxCJp.js";import{s as de}from"./D48bCvKi.js";import{i as Y}from"./BfqK2EGk.js";import{a as we,b as $,I as zn,s as ze}from"./D5R6xdxA.js";import{p as _}from"./sYUqOKXK.js";import{b as Kn,c as Qn,d as Xn}from"./BxwwTl67.js";const Jn=`# 《封印されし者の右腕》 (Right Arm of the Forbidden One)

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
`,$n=`# 《封印されし者の左腕》 (Left Arm of the Forbidden One)

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
`,et=`# 《封印されし者の右足》 (Right Leg of the Forbidden One)

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
`,nt=`# 《封印されし者の左足》 (Left Leg of the Forbidden One)

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
`,tt=`# 《千眼の邪教神》 (Thousand-Eyes Idol)

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
`,it=`# 《ガード・オブ・フレムベル》 (Flamvell Guard)

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
`,st=`# 《スペース・オマジナイ・ウサギ》 (Lunar Rabbit Omajinai)

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
`,at=`# 《封印されしエクゾディア》 (Exodia the Forbidden One)
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
`,rt=`# 《王立魔法図書館》 (Royal Magical Library)
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
`,ot=`# 《召喚僧サモンプリースト》 (Summoner Monk)
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
`,ct=`# 《クリッター》 (Sangan)
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
`,lt=`# 《黒き森のウィッチ》 (Witch of the Black Forest)
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
`,dt=`# 《魔導サイエンティスト》 (Magical Scientist)
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
`,ut=`# 《カタパルト・タートル》 (Catapult Turtle)
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
`,ft=`# 《トゥーン・キャノン・ソルジャー》 (Toon Cannon Soldier)
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
`,pt=`# 《トレジャー・パンダー》 (Treasure Panda)
#
# 起動効果:
# - CONDITIONS: 墓地に魔法・罠カードが存在
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
      activations:
        - step: "SELECT_AND_BANISH_FROM_GRAVEYARD"
          args: { minCount: 1, maxCount: 3, filterType: "spell_or_trap", faceDown: true }
      resolutions:
        - step: "SPECIAL_SUMMON_FROM_DECK"
          args: { filterType: "normal_monster", filterLevel: "paidCosts", count: 1 }
`,mt=`# 《紅陽鳥》 (Crimson Sunbird)

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
`,St=`# 《アクア・ドラゴン》 (Aqua Dragon)

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
`,ht=`# 《金色の魔象》 (Great Mammoth of Goldfine)

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
`,gt=`# 《フォーミュラ・シンクロン》 (Formula Synchron)
#
# 誘発効果:
# - CONDITIONS: このカードがシンクロ召喚に成功した時
# - ACTIVATIONS: 無し
# - RESOLUTIONS: 1枚ドローする
#
# Note: 相手ターンにシンクロ召喚できる効果は未実装
# 本来は任意効果だが、一旦強制効果としている

id: 50091196

data:
  jaName: "フォーミュラ・シンクロン"
  type: "monster"
  frameType: "synchro"
  monsterTypeList: ["effect"]
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
          isMandatory: true
          selfOnly: true
      resolutions:
        - step: "DRAW"
          args: { count: 1 }
`,Tt=`# 《ＴＧ ハイパー・ライブラリアン》 (T.G. Hyper Librarian)
#
# 誘発効果:
# - CONDITIONS: 他のカードがシンクロ召喚に成功した時
# - ACTIVATIONS: 無し
# - RESOLUTIONS: 1枚ドローする
#
# 本来は任意効果だが、一旦強制効果としている

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
`,Ct=`# 《スターダスト・チャージ・ウォリアー》 (Stardust Charge Warrior)
#
# 誘発効果:
# - CONDITIONS: このカードがシンクロ召喚に成功した時
# - ACTIVATIONS: 無し
# - RESOLUTIONS: 1枚ドローする
# TODO: 同名ターン1回制限を実装する
#
# Note: 特殊召喚された相手モンスター全てに攻撃できる効果は未実装
# 本来は任意効果だが、一旦強制効果としている

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
          isMandatory: true
          selfOnly: true
      resolutions:
        - step: "DRAW"
          args: { count: 1 }
`,It=`# 《死者蘇生》 (Monster Reborn)
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
      - step: "SELECT_TARGET_FROM_GRAVEYARD"
    resolutions:
      - step: "SPECIAL_SUMMON_FROM_CONTEXT"
`,vt=`# 《強欲な壺》 (Pot of Greed)
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
`,yt=`# 《成金ゴブリン》 (Upstart Goblin)
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
`,At=`# 《天使の施し》 (Graceful Charity)
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
`,Et=`# 《テラ・フォーミング》 (Terraforming)
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
`,Ot=`# 《魔法石の採掘》 (Magical Stone Excavation)
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
`,_t=`# 《無の煉獄》 (Into the Void)
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
`,Rt=`# 《命削りの宝札》 (Card of Demise)
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
`,Nt=`# 《闇の量産工場》 (Dark Factory of Mass Production)
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
`,Dt=`# 《一時休戦》 (One Day of Peace)
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
`,bt=`# 《トゥーンのもくじ》 (Toon Table of Contents)
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
`,Lt=`# 《強欲で謙虚な壺》 (Pot of Duality)
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
`,Vt=`# 《打ち出の小槌》 (Magical Mallet)
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
`,Pt=`# 《黄金色の竹光》 (Golden Bamboo Sword)
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
`,xt=`# 《馬の骨の対価》 (White Elephant's Gift)
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
`,kt=`# 《手札断殺》 (Hand Destruction)
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
`,Mt=`# 《リロード》 (Reload)
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
`,wt=`# 《トゥーン・ワールド》 (Toon World)
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
`,Ft=`# 《チキンレース》 (Chicken Game)
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
`,Gt=`# 《折れ竹光》 (Broken Bamboo Sword)
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
`,Ut=`# 《ワンダー・ワンド》 (Wonder Wand)
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
`,Yt=`# 《早すぎた埋葬》 (Premature Burial)
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
      - step: "SELECT_TARGET_FROM_GRAVEYARD"
    resolutions:
      - step: "SPECIAL_SUMMON_FROM_CONTEXT"
        args: { clearContext: false }
      - step: "ESTABLISH_EQUIP"
`,Ke=new Map([[70903634,Jn],[7902349,$n],[8124921,et],[44519536,nt],[27125110,tt],[21615956,it],[47643326,st],[33396948,at],[70791313,rt],[423585,ot],[26202165,ct],[78010363,lt],[34206604,dt],[95727991,ut],[79875176,ft],[45221020,pt],[46696593,mt],[86164529,St],[54622031,ht],[50091196,gt],[90953320,Tt],[64880894,Ct],[83764719,It],[55144522,vt],[70368879,yt],[79571449,At],[73628505,Et],[98494543,Ot],[93946239,_t],[59750328,Rt],[90928333,Nt],[33782437,Dt],[89997728,bt],[98645731,Lt],[85852291,Vt],[74029853,Pt],[18756904,xt],[74519184,kt],[22589918,Mt],[15259703,wt],[67616300,Ft],[41587307,Gt],[67775894,Ut],[70828912,Yt]]);class jt{constructor(e,n,t=1){d(this,"cardId");d(this,"effectId");d(this,"effectCategory","trigger");d(this,"spellSpeed");this.cardId=e,this.spellSpeed=t,this.effectId=ye.Id.create("trigger",e,n)}canActivate(e,n){const t=this.individualConditions(e,n);return t.isValid?r.Validation.success():t}createActivationSteps(e,n){return[Ae(n.id),...this.individualActivationSteps(e,n)]}createResolutionSteps(e,n){return[...this.individualResolutionSteps(e,n)]}}function qt(a){return a.effectCategory==="trigger"}class y{static registerActivation(e,n){const t=this.getOrCreateEntry(e);t.activation=n}static registerIgnition(e,n){this.getOrCreateEntry(e).ignitionEffects.push(n)}static registerTrigger(e,n){this.getOrCreateEntry(e).triggerEffects.push(n)}static getActivation(e){var n;return(n=this.effects.get(e))==null?void 0:n.activation}static getIgnitionEffects(e){var n;return((n=this.effects.get(e))==null?void 0:n.ignitionEffects)??[]}static hasIgnitionEffects(e){const n=this.effects.get(e);return n!==void 0&&n.ignitionEffects.length>0}static getTriggerEffects(e){var n;return((n=this.effects.get(e))==null?void 0:n.triggerEffects)??[]}static hasTriggerEffects(e){const n=this.effects.get(e);return n!==void 0&&n.triggerEffects.length>0}static collectTriggerSteps(e,n,t){const i=[],s=(o,l)=>{for(const p of o){if(l&&!m.Instance.isFaceUp(p))continue;const c=this.getTriggerEffects(p.id);for(const u of c){if(!qt(u)||!u.triggers.includes(n.type)||u.selfOnly&&n.sourceInstanceId!==p.instanceId||!u.canActivate(e,p).isValid||!u.isMandatory)continue;const S=u.createActivationSteps(e,p),A=u.createResolutionSteps(e,p);t({sourceInstanceId:p.instanceId,sourceCardId:p.id,effectId:u.effectId,spellSpeed:u.spellSpeed,resolutionSteps:A,isNegated:!1}),i.push(...S)}}};return s(e.space.hand,!1),s(e.space.mainMonsterZone,!0),s(e.space.spellTrapZone,!0),s(e.space.fieldZone,!0),s(e.space.graveyard,!1),s(e.space.banished,!1),i}static collectChainableActions(e,n,t=new Set){const i=[];for(const s of e.space.hand)t.has(s.instanceId)||(this.collectActivation(i,s,e,n),this.collectEffects(i,s,e,n));for(const s of e.space.mainMonsterZone)t.has(s.instanceId)||m.Instance.isFaceUp(s)&&this.collectEffects(i,s,e,n);for(const s of e.space.spellTrapZone)t.has(s.instanceId)||(m.Instance.isFaceDown(s)?this.collectActivation(i,s,e,n):this.collectEffects(i,s,e,n));for(const s of e.space.fieldZone)t.has(s.instanceId)||m.Instance.isFaceUp(s)&&this.collectEffects(i,s,e,n);for(const s of e.space.graveyard)t.has(s.instanceId)||this.collectEffects(i,s,e,n);for(const s of e.space.banished)t.has(s.instanceId)||this.collectEffects(i,s,e,n);return i}static collectActivation(e,n,t,i){const s=this.getActivation(n.id);s&&this.tryAddAction(e,n,s,t,i)}static collectEffects(e,n,t,i){for(const s of this.getIgnitionEffects(n.id))this.tryAddAction(e,n,s,t,i);for(const s of this.getTriggerEffects(n.id))this.tryAddAction(e,n,s,t,i)}static tryAddAction(e,n,t,i,s){if(t.spellSpeed<s)return;t.canActivate(i,n).isValid&&e.push({instance:n,action:t})}static clear(){this.effects.clear()}static getRegisteredCardIds(){return Array.from(this.effects.keys())}static getOrCreateEntry(e){let n=this.effects.get(e);return n||(n={ignitionEffects:[],triggerEffects:[]},this.effects.set(e,n)),n}}d(y,"effects",new Map);class oe{constructor(e){d(this,"cardId");d(this,"effectId");d(this,"effectCategory","activation");this.cardId=e,this.effectId=ye.Id.create("activation",e)}canActivate(e,n){const t=this.subTypeConditions(e,n);if(!t.isValid)return t;const i=this.individualConditions(e,n);return i.isValid?r.Validation.success():i}createActivationSteps(e,n){return[Ae(this.cardId),kn(n),...this.subTypePreActivationSteps(e,n),...this.individualActivationSteps(e,n),...this.subTypePostActivationSteps(e,n)]}createResolutionSteps(e,n){return[...this.subTypePreResolutionSteps(e,n),...this.individualResolutionSteps(e,n),...this.subTypePostResolutionSteps(e,n)]}}class Qe extends oe{constructor(){super(...arguments);d(this,"spellSpeed",1)}subTypeConditions(n,t){return f.Phase.isMain(n.phase)?r.Validation.success():r.Validation.failure(r.Validation.ERROR_CODES.NOT_MAIN_PHASE)}subTypePreActivationSteps(n,t){return[]}subTypePostActivationSteps(n,t){return[]}subTypePreResolutionSteps(n,t){return[]}subTypePostResolutionSteps(n,t){return[]}static createNoOp(n){return new Ht(n)}}class Ht extends Qe{constructor(e){super(e)}individualConditions(){return r.Validation.success()}individualActivationSteps(){return[]}individualResolutionSteps(){return[]}}class Ee extends oe{constructor(){super(...arguments);d(this,"spellSpeed",1)}useDefaultEquipTargetSelection(){return!0}subTypeConditions(n,t){return f.Phase.isMain(n.phase)?this.useDefaultEquipTargetSelection()&&n.space.mainMonsterZone.filter(s=>s.type==="monster"&&m.Instance.isFaceUp(s)).length===0?r.Validation.failure(r.Validation.ERROR_CODES.NO_VALID_TARGET):r.Validation.success():r.Validation.failure(r.Validation.ERROR_CODES.NOT_MAIN_PHASE)}subTypePreActivationSteps(n,t){return[]}subTypePostActivationSteps(n,t){if(!this.useDefaultEquipTargetSelection())return[];const i=this.effectId,s=o=>!(o.type!=="monster"||!m.Instance.isFaceUp(o));return[He({id:`${this.cardId}-select-equip-target`,summary:"装備対象を選択",description:"装備するモンスターを1体選択してください",availableCards:null,_sourceZone:"mainMonsterZone",_filter:s,minCards:1,maxCards:1,onSelect:(o,l)=>l.length===0?r.Result.failure(o,"No target selected"):Mn(i,"装備対象を保存").action(o,l)})]}subTypePreResolutionSteps(n,t){return[]}subTypePostResolutionSteps(n,t){return[wn(this.effectId,t.instanceId)]}static createNoOp(n){return new Bt(n)}}class Bt extends Ee{constructor(e){super(e)}individualConditions(){return r.Validation.success()}individualActivationSteps(){return[]}individualResolutionSteps(){return[]}}class Oe extends oe{constructor(){super(...arguments);d(this,"spellSpeed",1)}subTypeConditions(n,t){return f.Phase.isMain(n.phase)?r.Validation.success():r.Validation.failure(r.Validation.ERROR_CODES.NOT_MAIN_PHASE)}subTypePreActivationSteps(n,t){return[]}subTypePostActivationSteps(n,t){return[]}subTypePreResolutionSteps(n,t){return[]}subTypePostResolutionSteps(n,t){return[]}static createNoOp(n){return new Wt(n)}}class Wt extends Oe{constructor(e){super(e)}individualConditions(){return r.Validation.success()}individualActivationSteps(){return[]}individualResolutionSteps(){return[]}}class fe{static register(e,n){const t=this.rules.get(e)||[];this.rules.set(e,[...t,n])}static get(e){return this.rules.get(e)||[]}static getByCategory(e,n){return this.get(e).filter(i=>i.category===n)}static collectActiveRules(e,n){const t=[],i=[...e.space.spellTrapZone,...e.space.fieldZone];for(const s of i){if(!m.Instance.isFaceUp(s))continue;const o=this.getByCategory(s.id,n);for(const l of o)l.canApply(e)&&t.push(l)}return t}static collectTriggerRules(e,n){var s;const t=[],i=[...e.space.mainMonsterZone,...e.space.spellTrapZone,...e.space.fieldZone];for(const o of i){if(!m.Instance.isFaceUp(o))continue;const l=this.getByCategory(o.id,"TriggerRule");for(const p of l)(s=p.triggers)!=null&&s.includes(n)&&t.push({rule:p,sourceInstance:o})}return t}static collectTriggerSteps(e,n){const t=this.collectTriggerRules(e,n.type),i=[];for(const{rule:s,sourceInstance:o}of t){if(!s.canApply(e)||!s.createTriggerSteps||s.selfOnly&&n.sourceInstanceId!==o.instanceId||s.excludeSelf&&n.sourceInstanceId===o.instanceId)continue;const l=s.createTriggerSteps(e,o);i.push(...l)}return i}static clear(){this.rules.clear()}static getRegisteredCardIds(){return Array.from(this.rules.keys())}}d(fe,"rules",new Map);class Xe extends oe{constructor(){super(...arguments);d(this,"spellSpeed",1)}subTypeConditions(n,t){return f.Phase.isMain(n.phase)?r.Validation.success():r.Validation.failure(r.Validation.ERROR_CODES.NOT_MAIN_PHASE)}subTypePreActivationSteps(n,t){return[]}subTypePostActivationSteps(n){return[]}subTypePreResolutionSteps(n,t){return[]}subTypePostResolutionSteps(n,t){return[Be(t.instanceId,t.jaName)]}static createNoOp(n){return new Zt(n)}}class Zt extends Xe{constructor(e){super(e)}individualConditions(){return r.Validation.success()}individualActivationSteps(){return[]}individualResolutionSteps(){return[]}}class zt extends Xe{constructor(n,t){super(n);d(this,"dslDefinition");this.dslDefinition=t}buildSteps(n,t){if(!n||n.length===0)return[];const i={cardId:this.cardId,sourceInstanceId:t.instanceId,effectId:this.effectId};return n.map(s=>Z(s.step,s.args??{},i))}individualConditions(n,t){const i=this.dslDefinition.conditions;if(!i||!i.requirements||i.requirements.length===0)return r.Validation.success();for(const s of i.requirements){const o=ee(s.step,n,t,s.args??{});if(!o.isValid)return o}return r.Validation.success()}individualActivationSteps(n,t){return this.buildSteps(this.dslDefinition.activations,t)}individualResolutionSteps(n,t){return this.buildSteps(this.dslDefinition.resolutions,t)}}function Kt(a,e){return new zt(a,e)}class Je extends oe{constructor(){super(...arguments);d(this,"spellSpeed",2)}subTypeConditions(n,t){var i;return m.Instance.isFaceDown(t)&&((i=t.stateOnField)!=null&&i.placedThisTurn)?r.Validation.failure(r.Validation.ERROR_CODES.QUICK_PLAY_RESTRICTION):r.Validation.success()}subTypePreActivationSteps(n,t){return[]}subTypePostActivationSteps(n,t){return[]}subTypePreResolutionSteps(n,t){return[]}subTypePostResolutionSteps(n,t){return[Be(t.instanceId,t.jaName)]}static createNoOp(n){return new Qt(n)}}class Qt extends Je{constructor(e){super(e)}individualConditions(){return r.Validation.success()}individualActivationSteps(){return[]}individualResolutionSteps(){return[]}}class Xt extends Je{constructor(n,t){super(n);d(this,"dslDefinition");this.dslDefinition=t}buildSteps(n,t){if(!n||n.length===0)return[];const i={cardId:this.cardId,sourceInstanceId:t.instanceId};return n.map(s=>Z(s.step,s.args??{},i))}individualConditions(n,t){const i=this.dslDefinition.conditions;if(!i||!i.requirements||i.requirements.length===0)return r.Validation.success();for(const s of i.requirements){const o=ee(s.step,n,t,s.args??{});if(!o.isValid)return o}return r.Validation.success()}individualActivationSteps(n,t){return this.buildSteps(this.dslDefinition.activations,t)}individualResolutionSteps(n,t){return this.buildSteps(this.dslDefinition.resolutions,t)}}function Jt(a,e){return new Xt(a,e)}class $t extends Oe{constructor(n,t){super(n);d(this,"dslDefinition");this.dslDefinition=t}buildSteps(n,t){if(!n||n.length===0)return[];const i={cardId:this.cardId,sourceInstanceId:t.instanceId};return n.map(s=>Z(s.step,s.args??{},i))}individualConditions(n,t){const i=this.dslDefinition.conditions;if(!i||!i.requirements||i.requirements.length===0)return r.Validation.success();for(const s of i.requirements){const o=ee(s.step,n,t,s.args??{});if(!o.isValid)return o}return r.Validation.success()}individualActivationSteps(n,t){return this.buildSteps(this.dslDefinition.activations,t)}individualResolutionSteps(n,t){return this.buildSteps(this.dslDefinition.resolutions,t)}}function ei(a,e){return new $t(a,e)}class ni extends Ee{constructor(n,t){super(n);d(this,"dslDefinition");this.dslDefinition=t}buildSteps(n,t){if(!n||n.length===0)return[];const i={cardId:this.cardId,sourceInstanceId:t.instanceId,effectId:this.effectId};return n.map(s=>Z(s.step,s.args??{},i))}hasExplicitTargetSelection(){var n;return((n=this.dslDefinition.activations)==null?void 0:n.some(t=>t.step.startsWith("SELECT_TARGET_")))??!1}useDefaultEquipTargetSelection(){return!this.hasExplicitTargetSelection()}individualConditions(n,t){const i=this.dslDefinition.conditions;if(!i||!i.requirements||i.requirements.length===0)return r.Validation.success();for(const s of i.requirements){const o=ee(s.step,n,t,s.args??{});if(!o.isValid)return o}return r.Validation.success()}individualActivationSteps(n,t){return this.buildSteps(this.dslDefinition.activations,t)}individualResolutionSteps(n,t){return this.buildSteps(this.dslDefinition.resolutions,t)}}function ti(a,e){return new ni(a,e)}class ii{constructor(e,n){d(this,"cardId");d(this,"effectId");d(this,"effectCategory","ignition");d(this,"spellSpeed",1);this.cardId=e,this.effectId=ye.Id.create("ignition",e,n)}canActivate(e,n){if(!f.Phase.isMain(e.phase))return r.Validation.failure(r.Validation.ERROR_CODES.NOT_MAIN_PHASE);const t=this.individualConditions(e,n);return t.isValid?r.Validation.success():t}createActivationSteps(e,n){return[Ae(n.id),...this.individualActivationSteps(e,n)]}createResolutionSteps(e,n){return[...this.individualResolutionSteps(e,n)]}}class si extends ii{constructor(n,t,i){super(n,t);d(this,"dslDefinition");this.dslDefinition=i}buildSteps(n,t){if(!n||n.length===0)return[];const i={cardId:this.cardId,effectId:this.effectId,sourceInstanceId:t.instanceId};return n.map(s=>Z(s.step,s.args??{},i))}individualConditions(n,t){const i=this.dslDefinition.conditions;if(!i||!i.requirements||i.requirements.length===0)return r.Validation.success();for(const s of i.requirements){const o=ee(s.step,n,t,s.args??{});if(!o.isValid)return o}return r.Validation.success()}individualActivationSteps(n,t){return this.buildSteps(this.dslDefinition.activations,t)}individualResolutionSteps(n,t){return this.buildSteps(this.dslDefinition.resolutions,t)}}function ai(a,e,n){return new si(a,e,n)}class ri extends jt{constructor(n,t,i){var o;super(n,t,i.spellSpeed??1);d(this,"triggers");d(this,"triggerTiming");d(this,"isMandatory");d(this,"selfOnly");d(this,"excludeSelf");d(this,"dslDefinition");this.dslDefinition=i;const s=(o=i.conditions)==null?void 0:o.trigger;this.triggers=(s==null?void 0:s.events)??[],this.triggerTiming=(s==null?void 0:s.timing)??"if",this.isMandatory=(s==null?void 0:s.isMandatory)??!0,this.selfOnly=(s==null?void 0:s.selfOnly)??!1,this.excludeSelf=(s==null?void 0:s.excludeSelf)??!1}buildSteps(n,t){if(!n||n.length===0)return[];const i={cardId:this.cardId,sourceInstanceId:t.instanceId};return n.map(s=>Z(s.step,s.args??{},i))}individualConditions(n,t){var s;const i=(s=this.dslDefinition.conditions)==null?void 0:s.requirements;if(!i||i.length===0)return r.Validation.success();for(const o of i){const l=ee(o.step,n,t,o.args??{});if(!l.isValid)return l}return r.Validation.success()}individualActivationSteps(n,t){return this.buildSteps(this.dslDefinition.activations,t)}individualResolutionSteps(n,t){return this.buildSteps(this.dslDefinition.resolutions,t)}}function oi(a,e,n){return new ri(a,e,n)}class ci{constructor(e){d(this,"cardId");d(this,"isEffect",!0);this.cardId=e}canApply(e){return this.isOnFieldFaceUp(e)?this.individualConditions(e):!1}isOnFieldFaceUp(e){return[...e.space.mainMonsterZone,...e.space.spellTrapZone,...e.space.fieldZone].some(t=>t.id===this.cardId&&m.Instance.isFaceUp(t))}}const li=new Map([]);function di(a){const e=li.get(a);e&&e()}class ui extends ci{constructor(n,t){var s;super(n);d(this,"category");d(this,"triggers");d(this,"triggerTiming");d(this,"isMandatory");d(this,"selfOnly");d(this,"dslDefinition");this.dslDefinition=t,this.category=t.category;const i=(s=t.conditions)==null?void 0:s.trigger;this.triggers=(i==null?void 0:i.events)??[],this.triggerTiming=(i==null?void 0:i.timing)??"if",this.isMandatory=(i==null?void 0:i.isMandatory)??!0,this.selfOnly=(i==null?void 0:i.selfOnly)??!1}individualConditions(n){return!0}createTriggerSteps(n,t){const i=this.dslDefinition.resolutions??[],s={cardId:this.cardId,sourceInstanceId:t.instanceId};return i.map(o=>Z(o.step,o.args??{},s))}}function $e(a){var s;let e;try{e=Fn.load(a)}catch(o){throw new Ce(o instanceof Error?o.message:"Unknown YAML parse error",void 0,void 0,o instanceof Error?o:void 0)}if(e==null)throw new Ce("YAML content is empty or null");if(typeof e!="object")throw new Ce(`Expected object at root, got ${typeof e}`);const n=e,t=typeof n.id=="number"?n.id:void 0,i=Gn.safeParse(e);if(!i.success){const o=i.error.issues.map(p=>`${p.path.join(".")}: ${p.message}`),l=((s=i.error.issues[0])==null?void 0:s.path.join("."))??"unknown";throw new Un(`Validation failed with ${i.error.issues.length} issue(s)`,t??0,l,o)}return i.data}function en(a){const{id:e,data:n}=a;z.register(e,{jaName:n.jaName,type:n.type,frameType:n.frameType,monsterTypeList:n.monsterTypeList,spellType:n.spellType,trapType:n.trapType,edition:n.edition??"latest",race:n.race,level:n.level,attack:n.attack,defense:n.defense})}function fi(a){const{id:e,data:n}=a,t=a.effectChainableActions,i=n.spellType;if(t!=null&&t.activations)if(i==="normal"){const s=Kt(e,t.activations);y.registerActivation(e,s)}else if(i==="quick-play"){const s=Jt(e,t.activations);y.registerActivation(e,s)}else if(i==="continuous"){const s=ei(e,t.activations);y.registerActivation(e,s)}else if(i==="equip"){const s=ti(e,t.activations);y.registerActivation(e,s)}else throw new Error(`Unsupported spell type "${i}" for card ID ${e}`);else if(i==="continuous"){const s=Oe.createNoOp(e);y.registerActivation(e,s)}else if(i==="field"){const s=Qe.createNoOp(e);y.registerActivation(e,s)}else if(i==="equip"){const s=Ee.createNoOp(e);y.registerActivation(e,s)}t!=null&&t.ignitions&&t.ignitions.forEach((s,o)=>{const l=ai(e,o+1,s);y.registerIgnition(e,l)}),t!=null&&t.triggers&&t.triggers.forEach((s,o)=>{const l=oi(e,o+1,s);y.registerTrigger(e,l)})}function pi(a){const{id:e}=a,n=a.effectAdditionalRules;if(n&&n.continuous)for(const t of n.continuous){const i=new ui(e,t);fe.register(e,i)}}function mi(a){const e=$e(a);en(e)}function Si(a){const e=$e(a);en(e),fi(e),pi(e)}const hi=new Map([]);function gi(a){const e=hi.get(a);e&&e()}const Ti=(a,e,n)=>[e,()=>z.register(e,{jaName:n,type:"trap",frameType:"trap",trapType:a,edition:"latest"})],Ci=new Map([Ti("normal",83968380,"強欲な瓶")]);function nn(a){const e=Ci.get(a);e&&e()}function Ii(a){z.clear();for(const e of a){const n=Ke.get(e);if(n){mi(n);continue}nn(e)}}function vi(a){z.clear(),y.clear(),fe.clear();for(const e of a){const n=Ke.get(e);if(n){Si(n);continue}nn(e),gi(e),di(e)}}const yi=(a,e,n,t,i)=>({success:!0,updatedState:f.checkVictory(a),message:e,emittedEvents:n,activationSteps:t??[],chainBlock:i}),Ai=(a,e)=>({success:!1,updatedState:a,error:e,activationSteps:[]}),L={Result:{success:yi,failure:Ai}};class Ei{constructor(){d(this,"description");this.description="Advance to next phase"}canExecute(e){if(e.result.isGameOver)return r.Validation.failure(r.Validation.ERROR_CODES.GAME_OVER);const n=f.Phase.next(e.phase);return f.Phase.changeable(e.phase,n).valid?r.Validation.success():r.Validation.failure(r.Validation.ERROR_CODES.PHASE_TRANSITION_NOT_ALLOWED)}execute(e){const n=this.canExecute(e);if(!n.isValid)return L.Result.failure(e,r.Validation.errorMessage(n));const t=f.Phase.next(e.phase),i=f.Phase.isEnd(t)&&e.queuedEndPhaseEffectIds.length>0,s=f.Phase.isEnd(t)?this.resetFieldCardActivatedEffects(e.space):e.space,o={...e,space:s,phase:t,activatedCardIds:f.Phase.isEnd(t)?new Set:e.activatedCardIds,queuedEndPhaseEffectIds:i?[]:e.queuedEndPhaseEffectIds};return L.Result.success(o,`${f.Phase.displayName(t)} です`)}getNextPhase(e){return f.Phase.next(e.phase)}resetFieldCardActivatedEffects(e){const n=t=>{if(!t.stateOnField||t.stateOnField.activatedEffects.size===0)return t;const i={...t.stateOnField,activatedEffects:new Set};return{...t,stateOnField:i}};return{...e,mainMonsterZone:e.mainMonsterZone.map(n),spellTrapZone:e.spellTrapZone.map(n),fieldZone:e.fieldZone.map(n)}}}class le{constructor(e,n){d(this,"description");this.cardInstanceId=e,this.mode=n,this.description=n==="summon"?`Summon monster ${e}`:`Set monster ${e}`}canExecute(e){return e.result.isGameOver?r.Validation.failure(r.Validation.ERROR_CODES.GAME_OVER):Yn(e,this.cardInstanceId)}execute(e){const n=this.canExecute(e);if(!n.isValid)return L.Result.failure(e,r.Validation.errorMessage(n));const t=this.mode==="summon"?"attack":"defense",i=jn(e,this.cardInstanceId,t);return i.type==="immediate"?L.Result.success(i.state,i.message,void 0,i.activationSteps):L.Result.success(e,i.message,void 0,[i.step])}getCardInstanceId(){return this.cardInstanceId}getMode(){return this.mode}}class Fe{constructor(e){d(this,"description");this.cardInstanceId=e,this.description=`Set spell/trap ${e}`}canExecute(e){if(e.result.isGameOver)return r.Validation.failure(r.Validation.ERROR_CODES.GAME_OVER);if(!f.Phase.isMain(e.phase))return r.Validation.failure(r.Validation.ERROR_CODES.NOT_MAIN_PHASE);const n=f.Space.findCard(e.space,this.cardInstanceId);return n?!m.isSpell(n)&&!m.isTrap(n)?r.Validation.failure(r.Validation.ERROR_CODES.NOT_SPELL_OR_TRAP_CARD):m.Instance.inHand(n)?!m.isFieldSpell(n)&&f.Space.isSpellTrapZoneFull(e.space)?r.Validation.failure(r.Validation.ERROR_CODES.SPELL_TRAP_ZONE_FULL):r.Validation.success():r.Validation.failure(r.Validation.ERROR_CODES.CARD_NOT_IN_HAND):r.Validation.failure(r.Validation.ERROR_CODES.CARD_NOT_FOUND)}execute(e){const n=this.canExecute(e);if(!n.isValid)return L.Result.failure(e,r.Validation.errorMessage(n));const t=f.Space.findCard(e.space,this.cardInstanceId),i={...e,space:this.moveSetSpellTrapCard(e.space,t)};return L.Result.success(i,`${m.nameWithBrackets(t)}をセットします`)}moveSetSpellTrapCard(e,n){if(m.isFieldSpell(n)){const t=f.Space.sendExistingFieldSpellToGraveyard(e);return f.Space.moveCard(t,n,"fieldZone",{position:"faceDown"})}return f.Space.moveCard(e,n,"spellTrapZone",{position:"faceDown"})}getCardInstanceId(){return this.cardInstanceId}}function tn(a,e){if(m.Instance.inHand(e)){if(m.isFieldSpell(e)){const n=f.Space.sendExistingFieldSpellToGraveyard(a);return f.Space.moveCard(n,e,"fieldZone",{position:"faceUp"})}if(m.isSpell(e)||m.isTrap(e))return f.Space.moveCard(a,e,"spellTrapZone",{position:"faceUp"});throw new Error("Invalid card type for activation")}return f.Space.updateCardStateInPlace(a,e,{position:"faceUp"})}class Ge{constructor(e){d(this,"description");this.cardInstanceId=e,this.description=`Activate spell card ${e}`}canExecute(e){if(e.result.isGameOver)return r.Validation.failure(r.Validation.ERROR_CODES.GAME_OVER);const n=f.Space.findCard(e.space,this.cardInstanceId);if(!n)return r.Validation.failure(r.Validation.ERROR_CODES.CARD_NOT_FOUND);if(!m.isSpell(n))return r.Validation.failure(r.Validation.ERROR_CODES.NOT_SPELL_CARD);if(!m.Instance.inHand(n)&&!(m.Instance.onField(n)&&m.Instance.isFaceDown(n)))return r.Validation.failure(r.Validation.ERROR_CODES.CARD_NOT_IN_VALID_LOCATION);if(!m.isFieldSpell(n)&&f.Space.isSpellTrapZoneFull(e.space))return r.Validation.failure(r.Validation.ERROR_CODES.SPELL_TRAP_ZONE_FULL);const t=y.getActivation(n.id);if(!t)return r.Validation.failure(r.Validation.ERROR_CODES.EFFECT_NOT_REGISTERED);const i=t.canActivate(e,n);return i.isValid?r.Validation.success():i}execute(e){const n=this.canExecute(e);if(!n.isValid)return L.Result.failure(e,r.Validation.errorMessage(n));const t=f.Space.findCard(e.space,this.cardInstanceId),i={...e,space:tn(e.space,t),activatedCardIds:f.updatedActivatedCardIds(e.activatedCardIds,t.id)},s=y.getActivation(t.id),o=(s==null?void 0:s.createActivationSteps(i,t))??[],l=(s==null?void 0:s.createResolutionSteps(i,t))??[],p=s?{effectId:s.effectId,sourceInstanceId:t.instanceId,sourceCardId:t.id,spellSpeed:s.spellSpeed,resolutionSteps:l,isNegated:!1}:void 0;return L.Result.success(i,void 0,[],o,p)}getCardInstanceId(){return this.cardInstanceId}}class Ue{constructor(e){d(this,"description");this.cardInstanceId=e,this.description=`Activate ignition effect of ${e}`}canExecute(e){if(e.result.isGameOver)return r.Validation.failure(r.Validation.ERROR_CODES.GAME_OVER);const n=f.Space.findCard(e.space,this.cardInstanceId);if(!n)return r.Validation.failure(r.Validation.ERROR_CODES.CARD_NOT_FOUND);if(!["fieldZone","spellTrapZone","mainMonsterZone"].includes(n.location))return r.Validation.failure(r.Validation.ERROR_CODES.CARD_NOT_ON_FIELD);if(!m.Instance.isFaceUp(n))return r.Validation.failure(r.Validation.ERROR_CODES.CARD_NOT_FACE_UP);const i=y.getIgnitionEffects(n.id);return i.length===0?r.Validation.failure(r.Validation.ERROR_CODES.NO_IGNITION_EFFECT):this.findActivatableEffect(i,e,n)?r.Validation.success():r.Validation.failure(r.Validation.ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET)}findActivatableEffect(e,n,t){return e.find(i=>i.canActivate(n,t).isValid)}execute(e){const n=this.canExecute(e);if(!n.isValid)return L.Result.failure(e,r.Validation.errorMessage(n));const t=f.Space.findCard(e.space,this.cardInstanceId),i=y.getIgnitionEffects(t.id),s=this.findActivatableEffect(i,e,t),o=t.stateOnField,l=new Set(o.activatedEffects);l.add(s.effectId);const p={...e,space:f.Space.updateCardStateInPlace(e.space,t,{activatedEffects:l})},c=s.createActivationSteps(p,t),u=s.createResolutionSteps(p,t),h={effectId:s.effectId,sourceInstanceId:t.instanceId,sourceCardId:t.id,spellSpeed:s.spellSpeed,resolutionSteps:u,isNegated:!1};return L.Result.success(p,void 0,[],c,h)}getCardInstanceId(){return this.cardInstanceId}}function Oi(a,e){if(!f.Phase.isMain(a.phase))return r.Validation.failure(r.Validation.ERROR_CODES.NOT_MAIN_PHASE);const n=f.Space.findCard(a.space,e);if(!n)return r.Validation.failure(r.Validation.ERROR_CODES.CARD_NOT_FOUND);if(n.frameType!=="synchro")return r.Validation.failure("NOT_SYNCHRO_MONSTER");if(n.location!=="extraDeck")return r.Validation.failure("CARD_NOT_IN_EXTRA_DECK");const t=n.level??0;return _i(a.space.mainMonsterZone,t)?r.Validation.success():r.Validation.failure("NO_VALID_SYNCHRO_MATERIALS")}function _i(a,e){const n=a.filter(s=>m.Instance.isFaceUp(s)),t=n.filter(s=>m.isTuner(s)),i=n.filter(s=>m.isNonTuner(s));return t.length===0||i.length===0?!1:Ri(t,i,e)}function Ri(a,e,n){for(const t of a){const i=t.level??0,s=n-i;if(s>0&&Ni(e,s))return!0}return!1}function Ni(a,e){const n=a.map(i=>i.level??0),t=new Set([0]);for(const i of n){const s=new Set;for(const o of t)s.add(o+i);for(const o of s)t.add(o)}return t.has(e)}function Di(a,e){if(a.length<2)return!1;const n=a.some(s=>m.isTuner(s)),t=a.some(s=>m.isNonTuner(s));return!n||!t?!1:a.reduce((s,o)=>s+(o.level??0),0)===e}function bi(a,e){const n=f.Space.findCard(a.space,e),t=n.level??0,i=He({id:`${n.id}-select-synchro-materials`,summary:"シンクロ素材を選択",description:`チューナー＋非チューナーを選び、レベル合計が ${t} になるようにしてください`,availableCards:null,_sourceZone:"mainMonsterZone",_filter:s=>m.Instance.isFaceUp(s),minCards:2,maxCards:5,cancelable:!0,canConfirm:s=>Di(s,t),onSelect:(s,o)=>{if(o.length===0)return r.Result.failure(s,"シンクロ召喚をキャンセルしました");let l=s.space;const p=[];for(const h of o){const S=f.Space.findCard(l,h);S&&(l=f.Space.moveCard(l,S,"graveyard"),p.push({type:"sentToGraveyard",sourceCardId:S.id,sourceInstanceId:S.instanceId}))}const c=f.Space.findCard(l,e);l=f.Space.moveCard(l,c,"mainMonsterZone",{position:"faceUp",battlePosition:"attack"});const u=[...p,{type:"synchroSummoned",sourceCardId:c.id,sourceInstanceId:c.instanceId}];return r.Result.success({...s,space:l},`${m.nameWithBrackets(c)}をシンクロ召喚しました`,u)}});return{type:"needsSelection",message:`${m.nameWithBrackets(n)}のシンクロ素材を選択してください`,step:i}}class Ye{constructor(e){d(this,"description");this.cardInstanceId=e,this.description=`Synchro Summon ${e}`}canExecute(e){return e.result.isGameOver?r.Validation.failure(r.Validation.ERROR_CODES.GAME_OVER):Oi(e,this.cardInstanceId)}execute(e){const n=this.canExecute(e);if(!n.isValid)return L.Result.failure(e,r.Validation.errorMessage(n));const t=bi(e,this.cardInstanceId);return L.Result.success(e,t.message,void 0,[t.step])}getCardInstanceId(){return this.cardInstanceId}}function sn(){return f.initialize({mainDeckCardIds:[],extraDeckCardIds:[]},z.getCard,{skipShuffle:!0,skipInitialDraw:!0})}const M=ue(sn());function Li(a){const e=[];a.mainDeck.forEach(t=>{for(let i=0;i<t.quantity;i++)e.push(t.id)});const n=[];return a.extraDeck.forEach(t=>{for(let i=0;i<t.quantity;i++)n.push(t.id)}),{mainDeckCardIds:e,extraDeckCardIds:n}}function Vi(a){const e=Li(a);M.set(f.initialize(e,z.getCard))}function se(){let a=sn();return M.subscribe(n=>{a=n})(),a}function je(){return{isBuilding:!1,stack:[],currentChainNumber:0,lastSpellSpeed:null}}function Pi(){const{subscribe:a,update:e,set:n}=ue(je()),t={subscribe:a,startChain:()=>{e(i=>({...i,isBuilding:!0,currentChainNumber:1}))},pushChainBlock:i=>{e(s=>{const o={...i,chainNumber:s.currentChainNumber};return{...s,stack:[...s.stack,o],currentChainNumber:s.currentChainNumber+1,lastSpellSpeed:i.spellSpeed}})},endChainBuilding:()=>{e(i=>({...i,isBuilding:!1}))},popChainBlock:()=>{const i=T(t);if(i.stack.length===0)return;const s=i.stack[i.stack.length-1];return e(o=>({...o,stack:o.stack.slice(0,-1)})),s},canChain:i=>{const s=T(t);return s.isBuilding?i>=(s.lastSpellSpeed??1):i>=1},getStackedInstanceIds:()=>{const i=T(t);return new Set(i.stack.map(s=>s.sourceInstanceId))},getRequiredSpellSpeed:()=>{const i=T(t);return i.stack.length===0?1:Math.max(2,i.lastSpellSpeed??2)},reset:()=>{n(je())}};return t}const b=Pi();function pe(a,e,n){const t=a.action(e,n);return t.success?(M.set(t.updatedState),{updatedState:t.updatedState,emittedEvents:t.emittedEvents||[]}):(console.error("[executeStepAction] Step action failed:",a.id,t.message),{updatedState:e,emittedEvents:[]})}const xi=async(a,e)=>({shouldContinue:!0,emittedEvents:pe(a,e).emittedEvents}),ki=async(a,e,n)=>{const t=pe(a,e);return n.notification&&n.notification.showInfo(a.summary,a.description),{shouldContinue:!0,delay:300,emittedEvents:t.emittedEvents}},Mi=async(a,e,n,t)=>{const i=a.cardSelectionConfig;let s;if(i.availableCards!==null)s=i.availableCards;else{if(!i._sourceZone)return console.error("_sourceZone must be specified when availableCards is null"),{shouldContinue:!1};const l=e.space[i._sourceZone],p=i._effectId?e.activationContexts[i._effectId]:void 0;s=i._filter?l.filter((c,u)=>i._filter(c,u,p)):l}let o=[];return await new Promise(l=>{t(p=>({...p,cardSelectionConfig:{availableCards:s,minCards:i.minCards,maxCards:i.maxCards,summary:i.summary,description:i.description,cancelable:i.cancelable,canConfirm:i.canConfirm,onConfirm:c=>{const u=T(M);o=pe(a,u,c).emittedEvents,t(S=>({...S,cardSelectionConfig:null})),l()},onCancel:()=>{t(c=>({...c,cardSelectionConfig:null})),l()}}}))}),{shouldContinue:!0,emittedEvents:o}},wi=async(a,e,n,t)=>{let i=[];return await new Promise(s=>{t(o=>({...o,confirmationConfig:{summary:a.summary,description:a.description,onConfirm:()=>{const l=T(M);i=pe(a,l).emittedEvents,t(c=>({...c,confirmationConfig:null})),s()}}}))}),{shouldContinue:!0,emittedEvents:i}};function Fi(a){const e=a.notificationLevel||"info";return e==="silent"?xi:e==="info"?ki:a.cardSelectionConfig?Mi:wi}function Gi(a,e,n,t){const i=[];for(const s of a){const o=fe.collectTriggerSteps(e,s);i.push(...o);const l=y.collectTriggerSteps(e,s,p=>{b.pushChainBlock(p)});i.push(...l)}return i.length===0?n:[...n.slice(0,t+1),...i,...n.slice(t+1)]}function Ui(){const{subscribe:a,update:e}=ue({isActive:!1,currentStep:null,steps:[],currentIndex:-1,notificationHandler:null,confirmationConfig:null,cardSelectionConfig:null,chainConfirmationConfig:null,eventTimeline:r.TimeLine.createEmptyTimeline()}),n=c=>{e(h=>({...h,isActive:!0,steps:c,currentIndex:0,currentStep:c[0]||null})),c[0]&&t()},t=async()=>{let c=T(p);if(!c.currentStep)return;if(qn(c.currentStep)){e(V=>({...V,eventTimeline:r.TimeLine.advanceTime(V.eventTimeline)})),i(c,e)&&t();return}const u=T(M),S=await Fi(c.currentStep)(c.currentStep,u,{notification:c.notificationHandler},e);if(S.emittedEvents&&S.emittedEvents.length>0){let A=c.eventTimeline;for(const P of S.emittedEvents)A=r.TimeLine.recordEvent(A,P);const V=T(M),U=Gi(S.emittedEvents,V,c.steps,c.currentIndex);e(P=>({...P,steps:U,eventTimeline:A})),c=T(p)}S.delay&&await new Promise(A=>setTimeout(A,S.delay)),S.shouldContinue&&i(c,e)&&t()};function i(c,u){const h=c.currentIndex+1;return h<c.steps.length?(u(S=>({...S,currentIndex:h,currentStep:S.steps[h]})),!0):(s(u),!1)}function s(c){c(h=>({...h,isActive:!1,currentStep:null,steps:[],currentIndex:-1}));const u=T(b);if(u.stack.length>0)if(u.isBuilding){const h=T(M),S=b.getRequiredSpellSpeed(),A=b.getStackedInstanceIds(),V=y.collectChainableActions(h,S,A);if(V.length>0){c(U=>({...U,chainConfirmationConfig:{chainableCards:V,onActivate:P=>{const q=V.find(me=>me.instance.instanceId===P);q&&p.activateChain(q.instance,q.action)},onPass:()=>{c(P=>({...P,chainConfirmationConfig:null})),o()}}}));return}setTimeout(()=>{o()},0)}else setTimeout(()=>{l()},0);else b.reset()}const o=()=>{b.endChainBuilding(),l()};function l(){const c=b.popChainBlock();if(!c){b.reset();return}!c.isNegated&&c.resolutionSteps.length>0?(e(u=>({...u,isActive:!0,steps:c.resolutionSteps,currentIndex:0,currentStep:c.resolutionSteps[0]||null})),t()):l()}const p={subscribe:a,registerNotificationHandler:c=>{e(u=>({...u,notificationHandler:c}))},handleEffectQueues:(c,u)=>{c&&(T(b).stack.length===0&&b.startChain(),b.pushChainBlock(c)),u&&u.length>0?n(u):c&&o()},activateChain:(c,u)=>{if(!b.canChain(u.spellSpeed)){console.warn("Invalid chain attempt: Spell speed too low.");return}e(U=>({...U,chainConfirmationConfig:null}));const h=T(M),S={...h,space:tn(h.space,c),activatedCardIds:f.updatedActivatedCardIds(h.activatedCardIds,c.id)};M.set(S);const A=u.createActivationSteps(S,c),V=u.createResolutionSteps(S,c);b.pushChainBlock({sourceInstanceId:c.instanceId,sourceCardId:c.id,effectId:u.effectId,spellSpeed:u.spellSpeed,resolutionSteps:V,isNegated:!1}),A.length>0?n(A):s(e)}};return p}const Yi=Ui();class ji{canExecuteCommand(e,...n){const t=se();return new e(...n).canExecute(t).isValid}executeCommand(e,...n){const t=se(),s=new e(...n).execute(t);return s.success&&this.applyCommandResult(s),s}applyCommandResult(e){M.set(e.updatedState),Yi.handleEffectQueues(e.chainBlock,e.activationSteps)}loadDeck(e){const n=Pe(e),t=xe(n);return Ii(t),{deckData:ke(n,t),uniqueCardIds:t}}initializeGame(e){const n=Pe(e),t=xe(n);vi(t);const i=ke(n,t);return this.startGame(n),{deckData:i,uniqueCardIds:t}}startGame(e){Vi(e)}getGameState(){return se()}findCardOnField(e){const n=se();return[...n.space.mainMonsterZone,...n.space.spellTrapZone,...n.space.fieldZone].find(i=>i.instanceId===e)}advancePhase(){return this.executeCommand(Ei)}async autoAdvanceToMainPhase(e,n){const t=se();if(t.turn!==1||t.phase!=="draw")return!1;for(let i=0;i<2;i++){e&&await e();const s=this.advancePhase();if(s.success)s.message&&n&&n(s.message);else return console.error(`[GameFacade] Auto advance failed: ${s.error}`),!1}return!0}canSummonMonster(e){return this.canExecuteCommand(le,e,"summon")}summonMonster(e){return this.executeCommand(le,e,"summon")}canSetMonster(e){return this.canExecuteCommand(le,e,"set")}setMonster(e){return this.executeCommand(le,e,"set")}canSetSpellTrap(e){return this.canExecuteCommand(Fe,e)}setSpellTrap(e){return this.executeCommand(Fe,e)}canActivateSpell(e){return this.canExecuteCommand(Ge,e)}activateSpell(e){return this.executeCommand(Ge,e)}canActivateIgnitionEffect(e){return this.canExecuteCommand(Ue,e)}activateIgnitionEffect(e){return this.executeCommand(Ue,e)}canSynchroSummon(e){return this.canExecuteCommand(Ye,e)}synchroSummon(e){return this.executeCommand(Ye,e)}}const ws=new ji;function qi(){return{credentials:"same-origin"}}async function Hi(a,e,n){try{return await a(e,n)}catch(t){throw console.error("API error:",t),new Error(`Failed to fetch: ${n.method} ${e}`)}}const Bi=ne({id:ae(),image_url:g(),image_url_small:g(),image_url_cropped:g()}),Wi=ne({set_name:g(),set_code:g(),set_rarity:g(),set_rarity_code:g(),set_price:g()}),Zi=ne({cardmarket_price:g(),tcgplayer_price:g(),ebay_price:g(),amazon_price:g(),coolstuffinc_price:g()}),zi=ne({ban_tcg:g().optional(),ban_ocg:g().optional(),ban_goat:g().optional()}),Ki=ne({id:ae(),name:g(),type:g(),humanReadableCardType:g(),frameType:g(),desc:g(),race:g(),ygoprodeck_url:g(),archetype:g().optional(),typeline:re(g()).optional(),atk:ae().optional(),def:ae().optional(),level:ae().optional(),attribute:g().optional(),banlist_info:zi.optional(),card_images:re(Bi),card_sets:re(Wi).optional(),card_prices:re(Zi).optional()}),Qi=ne({data:re(Ki)});function an(a){const e=a.card_images[0];return{id:a.id,name:a.name,type:a.type,frameType:a.frameType,desc:a.desc,archetype:a.archetype,atk:a.atk,def:a.def,level:a.level,attribute:a.attribute,race:a.type.toLowerCase().includes("monster")?a.race:void 0,images:e?{image:e.image_url,imageSmall:e.image_url_small,imageCropped:e.image_url_cropped}:null}}const Xi="https://db.ygoprodeck.com/api/v7",rn="cardinfo.php",qe=new Map;async function on(a,e){const t={...qi(),method:"GET"},i=`${Xi}/${e}`;try{const s=await Hi(a,i,t);if(!s.ok){if(console.error(`YGOPRODeck API Error: ${s.status} ${s.statusText} - ${i}`),s.status===429)throw new Error("YGOPRODeck API rate limit exceeded. Please reduce request frequency.");return null}const o=await s.json();return Qi.parse(o)}catch(s){throw s instanceof Hn?console.error("YGOPRODeck API response validation failed:",s.issues):console.error("YGOPRODeck API fetch failed:",s),s}}async function Ji(a,e){const n=`${rn}?id=${e}`,t=await on(a,n),i=t==null?void 0:t.data[0];return i?an(i):null}async function $i(a,e){if(e.length===0)return[];const n=[],t=[];for(const s of e){const o=qe.get(s);o?n.push(o):t.push(s)}let i=[];if(t.length>0){const s=t.join(","),o=`${rn}?id=${s}`,l=await on(a,o);if(l!=null&&l.data){i=l.data;for(const p of i)qe.set(p.id,p)}}return[...n,...i].map(an)}class es{async getCardsByIds(e,n){return $i(e,n)}async getCardById(e,n){const t=await Ji(e,n);if(!t)throw new Error(`Card not found: ID ${n}`);return t}}let ve=null;function ns(){return ve||(ve=new es),ve}function ts(a){const e=a.toLowerCase();return e.includes("monster")?"monster":e.includes("spell")?"spell":e.includes("trap")?"trap":null}function is(a){return a.toLowerCase()}function ss(a,e){const n=`${e.jaName} (ID: ${e.id})`,t=ts(a.type);t&&t!==e.type&&console.warn(`[CardData Mismatch] ${n}: type が一致しません。Domain="${e.type}", API="${t}" (raw: "${a.type}")`);const i=is(a.frameType);i!==e.frameType&&console.warn(`[CardData Mismatch] ${n}: frameType が一致しません。Domain="${e.frameType}", API="${i}" (raw: "${a.frameType}")`)}function as(a,e){ss(a,e);const n=e.type==="monster"&&a.atk!==void 0&&a.def!==void 0&&a.level!==void 0?{attack:a.atk,defense:a.def,level:a.level,attribute:a.attribute??"",race:a.race??""}:void 0;return{id:e.id,name:a.name,jaName:e.jaName,type:e.type,description:a.desc,frameType:e.frameType,edition:e.edition,archetype:a.archetype,monsterAttributes:n,images:a.images??void 0}}function rs(a){const e=z.get(a.id);return as(a,e)}function os(a){return a.map(e=>rs(e))}const cs={isInitialized:!1,isLoading:!1,error:null,data:new Map},G=ue(cs),ls=ns();async function Fs(a){const e=T(G);if(!(e.isInitialized&&a.every(n=>e.data.has(n)))){G.update(n=>({...n,isLoading:!0,error:null}));try{const n=a.filter(t=>!e.data.has(t));if(n.length>0){const t=await ls.getCardsByIds(fetch,n),i=os(t);G.update(s=>{const o=new Map(s.data);return i.forEach(l=>{o.set(l.id,l)}),{...s,isInitialized:!0,isLoading:!1,data:o}})}else G.update(t=>({...t,isInitialized:!0,isLoading:!1}))}catch(n){const t=n instanceof Error?n.message:"Failed to initialize display card data cache";throw console.error("[displayCardDataCache] Initialization error:",n),G.update(i=>({...i,isLoading:!1,error:t})),n}}}function Gs(a){return T(G).data.get(a)}const Us={subscribe:G.subscribe,get isInitialized(){return T(G).isInitialized},get isLoading(){return T(G).isLoading},get error(){return T(G).error}},ds={small:"w-16 h-24",medium:"w-22 h-32",large:"w-32 h-48"},us={small:"w-4 h-4 text-xs",medium:"w-6 h-6 text-xs",large:"w-8 h-8 text-sm"},fs=""+new URL("../assets/CardBack.DGn8cQOG.jpg",import.meta.url).href;var ps=R('<div class="w-full h-full flex items-center justify-center p-1"><img alt="裏向きカード" class="w-full h-full object-cover rounded-sm"/></div>'),ms=R('<img class="w-full h-full object-cover rounded-sm"/>'),Ss=R('<span class="text-xs opacity-75 select-none mt-1"> </span>'),hs=R('<div class="w-full h-full bg-surface-200-700-token rounded-sm flex flex-col items-center justify-center text-center overflow-hidden"><img class="w-full h-full object-cover opacity-30"/> <div class="absolute inset-0 flex flex-col items-center justify-center"><span class="text-xs select-none text-surface-600-300-token font-medium"> </span> <!></div></div>'),gs=R('<div class="w-full h-full bg-surface-200-700-token rounded-sm flex items-center justify-center"><img alt="" class="w-full h-full object-cover opacity-20"/> <div class="absolute inset-0 flex items-center justify-center"><span class="text-xs opacity-50 select-none">No Image</span></div></div>'),Ts=R('<div class="px-1 py-1 bg-surface-50-900-token border-t border-surface-300"><div class="text-xs font-medium truncate"> </div></div>'),Cs=R('<div class="flex-1 flex items-center justify-center p-1"><!></div> <!>',1),Is=R('<div class="absolute top-1 right-1 w-3 h-3 bg-primary-500 rounded-full animate-pulse"></div>'),vs=R('<div title="装備カード付き"><!></div>'),ys=R('<div class="absolute inset-0 bg-primary-500 opacity-10 pointer-events-none"></div>'),As=R("<!> <!> <!> <!>",1),Es=R("<button><!></button>"),Os=R("<div><!></div>");function Ys(a,e){We(e,!0);const n=v=>{var x=As(),K=Ie(x);{var te=C=>{var E=ps(),H=N(E);D(E),j(()=>$(H,"src",Se)),O(C,E)},Cn=C=>{var E=Cs(),H=Ie(E),En=N(H);{var On=w=>{var k=ms();j(()=>{$(k,"src",e.card.images.imageCropped),$(k,"alt",e.card.jaName||"カード")}),O(w,k)},_n=(w,k)=>{{var B=Q=>{var W=hs(),ie=N(W),Ve=J(ie,2),ge=N(Ve),Dn=N(ge,!0);D(ge);var bn=J(ge,2);{var Ln=Te=>{var X=Ss(),Vn=N(X,!0);D(X),j(()=>de(Vn,e.card.type)),O(Te,X)};Y(bn,Te=>{var X;(X=e.card)!=null&&X.type&&Te(Ln)})}D(Ve),D(W),j(()=>{$(ie,"src",Se),$(ie,"alt",p()),de(Dn,p())}),O(Q,W)},he=Q=>{var W=gs(),ie=N(W);Zn(2),D(W),j(()=>$(ie,"src",Se)),O(Q,W)};Y(w,Q=>{I(_e)?Q(B):Q(he,!1)},k)}};Y(En,w=>{var k,B;(B=(k=e.card)==null?void 0:k.images)!=null&&B.imageCropped?w(On):w(_n,!1)})}D(H);var Rn=J(H,2);{var Nn=w=>{var k=Ts(),B=N(k),he=N(B,!0);D(B),D(k),j(()=>de(he,e.card.jaName)),O(w,k)};Y(Rn,w=>{e.card&&!I(_e)&&w(Nn)})}O(C,E)};Y(K,C=>{S()?C(Cn,!1):C(te)})}var be=J(K,2);{var In=C=>{var E=Is();O(C,E)};Y(be,C=>{I(q)&&C(In)})}var Le=J(be,2);{var vn=C=>{var E=vs(),H=N(E);zn(H,{icon:"mdi:plus-circle-outline",class:"size-8 md:size-12 text-white"}),D(E),j(()=>ze(E,1,`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full shadow-md z-10 transition-opacity duration-200 ${V()?"opacity-100":"opacity-75"}`)),O(C,E)};Y(Le,C=>{A()&&C(vn)})}var yn=J(Le,2);{var An=C=>{var E=ys();O(C,E)};Y(yn,C=>{u()&&(I(U)||I(q))&&C(An)})}O(v,x)};let t=_(e,"size",3,"medium"),i=_(e,"clickable",3,!1),s=_(e,"selectable",3,!1),o=_(e,"isSelected",3,!1),l=_(e,"placeholder",3,!1),p=_(e,"placeholderText",3,"カード"),c=_(e,"rotation",3,0),u=_(e,"animate",3,!0),h=_(e,"showDetailOnClick",3,!1),S=_(e,"faceUp",3,!0),A=_(e,"isEquipped",3,!1),V=_(e,"isEquipmentHovered",3,!1),U=Me(!1),P=Me(!1),q=F(()=>s()?I(P):o());Wn(()=>{s()||ce(P,o())});function me(){var v;console.log(`[Card] クリックイベント発生: clickable=${i()}, card=${(v=e.card)==null?void 0:v.jaName}, hasOnClick=${!!e.onClick}`),i()&&e.card&&e.onClick&&(console.log(`[Card] onClickコールバックを実行します: ${e.card.jaName}`),e.onClick(e.card)),s()&&ce(P,!I(P)),h()&&e.card&&Xn(e.card)}function cn(){ce(U,!0),e.onHover&&e.card&&e.onHover(e.card)}function ln(){ce(U,!1),e.onHover&&e.onHover(null)}const _e=F(()=>l()||!e.card),Se=fs,dn=F(()=>u()?"transition-all duration-300 ease-in-out":""),un=F(()=>i()||s()||h()?"cursor-pointer hover:scale-105 hover:shadow-lg":""),fn=F(()=>I(q)?"ring-2 ring-primary-500 shadow-lg":""),pn=F(()=>c()!==0?`transform: rotate(${c()}deg);`:""),mn=F(()=>{var v;return Kn((v=e.card)==null?void 0:v.frameType)}),Sn=F(()=>{var v;return Qn((v=e.card)==null?void 0:v.edition)}),Re=F(()=>()=>`
      ${ds[t()]}
      ${I(dn)}
      ${I(un)}
      ${I(fn)}
      ${I(mn)}
      ${I(Sn)}
      border rounded aspect-[3/4] flex flex-col justify-between
      relative overflow-hidden
    `),Ne=F(()=>({style:I(pn),onclick:i()||s()||h()?me:void 0,onmouseenter:cn,onmouseleave:ln}));var De=Bn(),hn=Ie(De);{var gn=v=>{var x=Es();we(x,te=>({class:`${te??""} bg-transparent p-0 border border-2 border-gray-100`,...I(Ne)}),[()=>I(Re)()]);var K=N(x);n(K),D(x),O(v,x)},Tn=v=>{var x=Os();we(x,te=>({class:te,role:"img",...I(Ne)}),[()=>I(Re)()]);var K=N(x);n(K),D(x),O(v,x)};Y(hn,v=>{i()||s()||h()?v(gn):v(Tn,!1)})}O(a,De),Ze()}var _s=R("<div> </div>");function js(a,e){We(e,!0);let n=_(e,"size",3,"medium"),t=_(e,"colorClasses",3,"bg-primary-200 text-primary-900");var i=_s(),s=N(i,!0);D(i),j(()=>{ze(i,1,`absolute -top-2 -right-2 ${us[n()]??""} ${t()??""} rounded-full flex items-center justify-center font-bold shadow-md z-10`),de(s,e.count)}),O(a,i),Ze()}export{Ys as C,Gs as a,js as b,M as c,Us as d,ds as e,fs as f,ws as g,Yi as h,Fs as i};
