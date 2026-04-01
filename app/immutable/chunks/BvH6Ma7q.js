var xn=Object.defineProperty;var wn=(s,e,n)=>e in s?xn(s,e,{enumerable:!0,configurable:!0,writable:!0,value:n}):s[e]=n;var l=(s,e,n)=>wn(s,typeof e!="symbol"?e+"":e,n);import{E as Ee,G as r,n as ye,C as m,e as Fn,b as f,s as We,c as Gn,d as Un,f as Ze,h as Z,i as ee,j as Yn,k as jn,D as Ce,l as qn,m as Hn,o as K,A as fe,p as Bn,q as Wn,r as Zn,t as ke,u as Kn,v as zn,w as Me,x as xe,y as we,z as ne,B as T,F as se,H as re,I as Qn}from"./Cz1Y_lrO.js";import{w as pe,g}from"./BRwysdbX.js";import{c as Xn,a as O,f as D}from"./DzhCTwcu.js";import{l as Ke,am as Jn,t as le,aq as Fe,m as ve,n as ze,w as I,ar as G,z as L,B as V,y as J,x as j,aU as $n}from"./DdycUYWS.js";import{s as ue}from"./B3LOcbDP.js";import{i as Y}from"./BJuPdzhj.js";import{a as Ge,b as $,I as et,s as Qe}from"./C7qA0LbA.js";import{p as N}from"./Dt4QnRVV.js";import{b as nt,c as tt,d as it}from"./Pe6Ms52m.js";const at=`# 《封印されし者の右腕》 (Right Arm of the Forbidden One)

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
`,st=`# 《封印されし者の左腕》 (Left Arm of the Forbidden One)

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
`,rt=`# 《封印されし者の右足》 (Right Leg of the Forbidden One)

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
`,ot=`# 《封印されし者の左足》 (Left Leg of the Forbidden One)

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
`,ct=`# 《千眼の邪教神》 (Thousand-Eyes Idol)

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
`,lt=`# 《ガード・オブ・フレムベル》 (Flamvell Guard)

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
`,dt=`# 《スペース・オマジナイ・ウサギ》 (Lunar Rabbit Omajinai)

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
`,ut=`# 《封印されしエクゾディア》 (Exodia the Forbidden One)
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
`,ft=`# 《王立魔法図書館》 (Royal Magical Library)
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
`,pt=`# 《召喚僧サモンプリースト》 (Summoner Monk)
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
`,mt=`# 《クリッター》 (Sangan)
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
`,St=`# 《黒き森のウィッチ》 (Witch of the Black Forest)
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
`,Tt=`# 《魔導サイエンティスト》 (Magical Scientist)
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
`,ht=`# 《カタパルト・タートル》 (Catapult Turtle)
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
`,gt=`# 《トゥーン・キャノン・ソルジャー》 (Toon Cannon Soldier)
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
`,Ct=`# 《トレジャー・パンダー》 (Treasure Panda)
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
`,vt=`# 《混沌の黒魔術師》 (Dark Magician of Chaos)
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
# - 本来は任意効果だが、一旦強制効果としている

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
          isMandatory: true
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
`,It=`# 《紅陽鳥》 (Crimson Sunbird)

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
`,At=`# 《アクア・ドラゴン》 (Aqua Dragon)

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
`,Et=`# 《金色の魔象》 (Great Mammoth of Goldfine)

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
`,yt=`# 《フォーミュラ・シンクロン》 (Formula Synchron)
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
`,Ot=`# 《ＴＧ ハイパー・ライブラリアン》 (T.G. Hyper Librarian)
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
`,_t=`# 《スターダスト・チャージ・ウォリアー》 (Stardust Charge Warrior)
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
`,Rt=`# 《メタルデビル・トークン》 (Metal Fiend Token)

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
`,Nt=`# 《死者蘇生》 (Monster Reborn)
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
`,Dt=`# 《強欲な壺》 (Pot of Greed)
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
`,bt=`# 《成金ゴブリン》 (Upstart Goblin)
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
`,Lt=`# 《天使の施し》 (Graceful Charity)
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
`,Vt=`# 《テラ・フォーミング》 (Terraforming)
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
`,Pt=`# 《魔法石の採掘》 (Magical Stone Excavation)
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
`,kt=`# 《無の煉獄》 (Into the Void)
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
`,Mt=`# 《命削りの宝札》 (Card of Demise)
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
`,xt=`# 《闇の量産工場》 (Dark Factory of Mass Production)
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
`,wt=`# 《一時休戦》 (One Day of Peace)
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
`,Ft=`# 《トゥーンのもくじ》 (Toon Table of Contents)
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
`,Gt=`# 《強欲で謙虚な壺》 (Pot of Duality)
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
`,Ut=`# 《打ち出の小槌》 (Magical Mallet)
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
`,Yt=`# 《黄金色の竹光》 (Golden Bamboo Sword)
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
`,jt=`# 《馬の骨の対価》 (White Elephant's Gift)
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
`,qt=`# 《デビルズ・サンクチュアリ》 (Fiend's Sanctuary)
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
`,Ht=`# 《モンスターゲート》 (Monster Gate)
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
`,Bt=`# 《名推理》 (Reasoning)
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
`,Wt=`# 《遺言状》 (Last Will)
#
# 永続効果（擬似）:
# - TRIGGER: 自分フィールドのカードが墓地へ送られた場合
# - EFFECT: デッキから攻撃力1500以下のモンスター1体を特殊召喚
#
# Note:
# 正確には通常魔法（発動後GYへ送られる残存効果）だが、
# 残存効果メカニズムが未実装のため「永続魔法」として擬似実装する。
# プレイヤー体験（フィールドにある間、モンスターがGYへ送られたら1度だけSS）は再現できる。

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
      resolutions:
        - step: "SPECIAL_SUMMON_FROM_DECK_BY_ATK"
          args: { maxAtk: 1500 }
`,Zt=`# 《手札断殺》 (Hand Destruction)
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
`,Kt=`# 《リロード》 (Reload)
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
`,zt=`# 《トゥーン・ワールド》 (Toon World)
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
`,Qt=`# 《チキンレース》 (Chicken Game)
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
`,Xt=`# 《折れ竹光》 (Broken Bamboo Sword)
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
`,Jt=`# 《ワンダー・ワンド》 (Wonder Wand)
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
`,$t=`# 《早すぎた埋葬》 (Premature Burial)
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
`,Ae=new Map([[70903634,at],[7902349,st],[8124921,rt],[44519536,ot],[27125110,ct],[21615956,lt],[47643326,dt],[33396948,ut],[70791313,ft],[423585,pt],[26202165,mt],[78010363,St],[34206604,Tt],[95727991,ht],[79875176,gt],[45221020,Ct],[40737112,vt],[46696593,It],[86164529,At],[54622031,Et],[50091196,yt],[90953320,Ot],[64880894,_t],[24874631,Rt],[83764719,Nt],[55144522,Dt],[70368879,bt],[79571449,Lt],[73628505,Vt],[98494543,Pt],[93946239,kt],[59750328,Mt],[90928333,xt],[33782437,wt],[89997728,Ft],[98645731,Gt],[85852291,Ut],[74029853,Yt],[18756904,jt],[24874630,qt],[43040603,Ht],[58577036,Bt],[85602018,Wt],[74519184,Zt],[22589918,Kt],[15259703,zt],[67616300,Qt],[41587307,Xt],[67775894,Jt],[70828912,$t]]);class ei{constructor(e,n,t=1){l(this,"cardId");l(this,"effectId");l(this,"effectCategory","trigger");l(this,"spellSpeed");this.cardId=e,this.spellSpeed=t,this.effectId=Ee.Id.create("trigger",e,n)}canActivate(e,n){const t=this.individualConditions(e,n);return t.isValid?r.Validation.success():t}createActivationSteps(e,n){return[ye(n.id),...this.individualActivationSteps(e,n)]}createResolutionSteps(e,n){return[...this.individualResolutionSteps(e,n)]}}function ni(s){return s.effectCategory==="trigger"}class E{static registerActivation(e,n){const t=this.getOrCreateEntry(e);t.activation=n}static registerIgnition(e,n){this.getOrCreateEntry(e).ignitionEffects.push(n)}static registerTrigger(e,n){this.getOrCreateEntry(e).triggerEffects.push(n)}static getActivation(e){var n;return(n=this.effects.get(e))==null?void 0:n.activation}static getIgnitionEffects(e){var n;return((n=this.effects.get(e))==null?void 0:n.ignitionEffects)??[]}static hasIgnitionEffects(e){const n=this.effects.get(e);return n!==void 0&&n.ignitionEffects.length>0}static getTriggerEffects(e){var n;return((n=this.effects.get(e))==null?void 0:n.triggerEffects)??[]}static hasTriggerEffects(e){const n=this.effects.get(e);return n!==void 0&&n.triggerEffects.length>0}static collectTriggerSteps(e,n,t){const i=[],a=(o,d)=>{for(const p of o){if(d&&!m.Instance.isFaceUp(p))continue;const c=this.getTriggerEffects(p.id);for(const u of c){if(!ni(u)||!u.triggers.includes(n.type)||u.selfOnly&&n.sourceInstanceId!==p.instanceId||u.excludeSelf&&n.sourceInstanceId===p.instanceId||!u.canActivate(e,p).isValid||!u.isMandatory)continue;const h=u.createActivationSteps(e,p),C=u.createResolutionSteps(e,p);t({sourceInstanceId:p.instanceId,sourceCardId:p.id,effectId:u.effectId,spellSpeed:u.spellSpeed,resolutionSteps:C,isNegated:!1}),i.push(...h)}}};return a(e.space.hand,!1),a(e.space.mainMonsterZone,!0),a(e.space.spellTrapZone,!0),a(e.space.fieldZone,!0),a(e.space.graveyard,!1),a(e.space.banished,!1),i}static collectChainableActions(e,n,t=new Set){const i=[];for(const a of e.space.hand)t.has(a.instanceId)||(this.collectActivation(i,a,e,n),this.collectEffects(i,a,e,n));for(const a of e.space.mainMonsterZone)t.has(a.instanceId)||m.Instance.isFaceUp(a)&&this.collectEffects(i,a,e,n);for(const a of e.space.spellTrapZone)t.has(a.instanceId)||(m.Instance.isFaceDown(a)?this.collectActivation(i,a,e,n):this.collectEffects(i,a,e,n));for(const a of e.space.fieldZone)t.has(a.instanceId)||m.Instance.isFaceUp(a)&&this.collectEffects(i,a,e,n);for(const a of e.space.graveyard)t.has(a.instanceId)||this.collectEffects(i,a,e,n);for(const a of e.space.banished)t.has(a.instanceId)||this.collectEffects(i,a,e,n);return i}static collectActivation(e,n,t,i){const a=this.getActivation(n.id);a&&this.tryAddAction(e,n,a,t,i)}static collectEffects(e,n,t,i){for(const a of this.getIgnitionEffects(n.id))this.tryAddAction(e,n,a,t,i);for(const a of this.getTriggerEffects(n.id))this.tryAddAction(e,n,a,t,i)}static tryAddAction(e,n,t,i,a){if(t.spellSpeed<a)return;t.canActivate(i,n).isValid&&e.push({instance:n,action:t})}static clear(){this.effects.clear()}static getRegisteredCardIds(){return Array.from(this.effects.keys())}static getOrCreateEntry(e){let n=this.effects.get(e);return n||(n={ignitionEffects:[],triggerEffects:[]},this.effects.set(e,n)),n}}l(E,"effects",new Map);class oe{constructor(e){l(this,"cardId");l(this,"effectId");l(this,"effectCategory","activation");this.cardId=e,this.effectId=Ee.Id.create("activation",e)}canActivate(e,n){const t=this.subTypeConditions(e,n);if(!t.isValid)return t;const i=this.individualConditions(e,n);return i.isValid?r.Validation.success():i}createActivationSteps(e,n){return[ye(this.cardId),Fn(n),...this.subTypePreActivationSteps(e,n),...this.individualActivationSteps(e,n),...this.subTypePostActivationSteps(e,n)]}createResolutionSteps(e,n){return[...this.subTypePreResolutionSteps(e,n),...this.individualResolutionSteps(e,n),...this.subTypePostResolutionSteps(e,n)]}}class Xe extends oe{constructor(){super(...arguments);l(this,"spellSpeed",1)}subTypeConditions(n,t){return f.Phase.isMain(n.phase)?r.Validation.success():r.Validation.failure(r.Validation.ERROR_CODES.NOT_MAIN_PHASE)}subTypePreActivationSteps(n,t){return[]}subTypePostActivationSteps(n,t){return[]}subTypePreResolutionSteps(n,t){return[]}subTypePostResolutionSteps(n,t){return[]}static createNoOp(n){return new ti(n)}}class ti extends Xe{constructor(e){super(e)}individualConditions(){return r.Validation.success()}individualActivationSteps(){return[]}individualResolutionSteps(){return[]}}class Oe extends oe{constructor(){super(...arguments);l(this,"spellSpeed",1)}useDefaultEquipTargetSelection(){return!0}subTypeConditions(n,t){return f.Phase.isMain(n.phase)?this.useDefaultEquipTargetSelection()&&n.space.mainMonsterZone.filter(a=>a.type==="monster"&&m.Instance.isFaceUp(a)).length===0?r.Validation.failure(r.Validation.ERROR_CODES.NO_VALID_TARGET):r.Validation.success():r.Validation.failure(r.Validation.ERROR_CODES.NOT_MAIN_PHASE)}subTypePreActivationSteps(n,t){return[]}subTypePostActivationSteps(n,t){if(!this.useDefaultEquipTargetSelection())return[];const i=this.effectId,a=o=>!(o.type!=="monster"||!m.Instance.isFaceUp(o));return[We({id:`${this.cardId}-select-equip-target`,summary:"装備対象を選択",description:"装備するモンスターを1体選択してください",availableCards:null,_sourceZone:"mainMonsterZone",_filter:a,minCards:1,maxCards:1,onSelect:(o,d)=>d.length===0?r.Result.failure(o,"No target selected"):Gn(i,"装備対象を保存").action(o,d)})]}subTypePreResolutionSteps(n,t){return[]}subTypePostResolutionSteps(n,t){return[Un(this.effectId,t.instanceId)]}static createNoOp(n){return new ii(n)}}class ii extends Oe{constructor(e){super(e)}individualConditions(){return r.Validation.success()}individualActivationSteps(){return[]}individualResolutionSteps(){return[]}}class _e extends oe{constructor(){super(...arguments);l(this,"spellSpeed",1)}subTypeConditions(n,t){return f.Phase.isMain(n.phase)?r.Validation.success():r.Validation.failure(r.Validation.ERROR_CODES.NOT_MAIN_PHASE)}subTypePreActivationSteps(n,t){return[]}subTypePostActivationSteps(n,t){return[]}subTypePreResolutionSteps(n,t){return[]}subTypePostResolutionSteps(n,t){return[]}static createNoOp(n){return new ai(n)}}class ai extends _e{constructor(e){super(e)}individualConditions(){return r.Validation.success()}individualActivationSteps(){return[]}individualResolutionSteps(){return[]}}class Je extends oe{constructor(){super(...arguments);l(this,"spellSpeed",1)}subTypeConditions(n,t){return f.Phase.isMain(n.phase)?r.Validation.success():r.Validation.failure(r.Validation.ERROR_CODES.NOT_MAIN_PHASE)}subTypePreActivationSteps(n,t){return[]}subTypePostActivationSteps(n){return[]}subTypePreResolutionSteps(n,t){return[]}subTypePostResolutionSteps(n,t){return[Ze(t.instanceId,t.jaName)]}static createNoOp(n){return new si(n)}}class si extends Je{constructor(e){super(e)}individualConditions(){return r.Validation.success()}individualActivationSteps(){return[]}individualResolutionSteps(){return[]}}class ri extends Je{constructor(n,t){super(n);l(this,"dslDefinition");this.dslDefinition=t}buildSteps(n,t){if(!n||n.length===0)return[];const i={cardId:this.cardId,sourceInstanceId:t.instanceId,effectId:this.effectId};return n.map(a=>Z(a.step,a.args??{},i))}individualConditions(n,t){const i=this.dslDefinition.conditions;if(!i||!i.requirements||i.requirements.length===0)return r.Validation.success();for(const a of i.requirements){const o=ee(a.step,n,t,a.args??{});if(!o.isValid)return o}return r.Validation.success()}individualActivationSteps(n,t){return this.buildSteps(this.dslDefinition.activations,t)}individualResolutionSteps(n,t){return this.buildSteps(this.dslDefinition.resolutions,t)}}function oi(s,e){return new ri(s,e)}class $e extends oe{constructor(){super(...arguments);l(this,"spellSpeed",2)}subTypeConditions(n,t){var i;return m.Instance.isFaceDown(t)&&((i=t.stateOnField)!=null&&i.placedThisTurn)?r.Validation.failure(r.Validation.ERROR_CODES.QUICK_PLAY_RESTRICTION):r.Validation.success()}subTypePreActivationSteps(n,t){return[]}subTypePostActivationSteps(n,t){return[]}subTypePreResolutionSteps(n,t){return[]}subTypePostResolutionSteps(n,t){return[Ze(t.instanceId,t.jaName)]}static createNoOp(n){return new ci(n)}}class ci extends $e{constructor(e){super(e)}individualConditions(){return r.Validation.success()}individualActivationSteps(){return[]}individualResolutionSteps(){return[]}}class li extends $e{constructor(n,t){super(n);l(this,"dslDefinition");this.dslDefinition=t}buildSteps(n,t){if(!n||n.length===0)return[];const i={cardId:this.cardId,sourceInstanceId:t.instanceId};return n.map(a=>Z(a.step,a.args??{},i))}individualConditions(n,t){const i=this.dslDefinition.conditions;if(!i||!i.requirements||i.requirements.length===0)return r.Validation.success();for(const a of i.requirements){const o=ee(a.step,n,t,a.args??{});if(!o.isValid)return o}return r.Validation.success()}individualActivationSteps(n,t){return this.buildSteps(this.dslDefinition.activations,t)}individualResolutionSteps(n,t){return this.buildSteps(this.dslDefinition.resolutions,t)}}function di(s,e){return new li(s,e)}class ui extends _e{constructor(n,t){super(n);l(this,"dslDefinition");this.dslDefinition=t}buildSteps(n,t){if(!n||n.length===0)return[];const i={cardId:this.cardId,sourceInstanceId:t.instanceId};return n.map(a=>Z(a.step,a.args??{},i))}individualConditions(n,t){const i=this.dslDefinition.conditions;if(!i||!i.requirements||i.requirements.length===0)return r.Validation.success();for(const a of i.requirements){const o=ee(a.step,n,t,a.args??{});if(!o.isValid)return o}return r.Validation.success()}individualActivationSteps(n,t){return this.buildSteps(this.dslDefinition.activations,t)}individualResolutionSteps(n,t){return this.buildSteps(this.dslDefinition.resolutions,t)}}function fi(s,e){return new ui(s,e)}class pi{constructor(e,n){l(this,"cardId");l(this,"effectId");l(this,"effectCategory","ignition");l(this,"spellSpeed",1);this.cardId=e,this.effectId=Ee.Id.create("ignition",e,n)}canActivate(e,n){if(!f.Phase.isMain(e.phase))return r.Validation.failure(r.Validation.ERROR_CODES.NOT_MAIN_PHASE);const t=this.individualConditions(e,n);return t.isValid?r.Validation.success():t}createActivationSteps(e,n){return[ye(n.id),...this.individualActivationSteps(e,n)]}createResolutionSteps(e,n){return[...this.individualResolutionSteps(e,n)]}}class mi extends pi{constructor(n,t,i){super(n,t);l(this,"dslDefinition");this.dslDefinition=i}buildSteps(n,t){if(!n||n.length===0)return[];const i={cardId:this.cardId,effectId:this.effectId,sourceInstanceId:t.instanceId};return n.map(a=>Z(a.step,a.args??{},i))}individualConditions(n,t){const i=this.dslDefinition.conditions;if(!i||!i.requirements||i.requirements.length===0)return r.Validation.success();for(const a of i.requirements){const o=ee(a.step,n,t,a.args??{});if(!o.isValid)return o}return r.Validation.success()}individualActivationSteps(n,t){return this.buildSteps(this.dslDefinition.activations,t)}individualResolutionSteps(n,t){return this.buildSteps(this.dslDefinition.resolutions,t)}}function Si(s,e,n){return new mi(s,e,n)}class Ti extends Oe{constructor(n,t){super(n);l(this,"dslDefinition");this.dslDefinition=t}buildSteps(n,t){if(!n||n.length===0)return[];const i={cardId:this.cardId,sourceInstanceId:t.instanceId,effectId:this.effectId};return n.map(a=>Z(a.step,a.args??{},i))}hasExplicitTargetSelection(){var n;return((n=this.dslDefinition.activations)==null?void 0:n.some(t=>t.step.startsWith("SELECT_TARGET_")))??!1}useDefaultEquipTargetSelection(){return!this.hasExplicitTargetSelection()}individualConditions(n,t){const i=this.dslDefinition.conditions;if(!i||!i.requirements||i.requirements.length===0)return r.Validation.success();for(const a of i.requirements){const o=ee(a.step,n,t,a.args??{});if(!o.isValid)return o}return r.Validation.success()}individualActivationSteps(n,t){return this.buildSteps(this.dslDefinition.activations,t)}individualResolutionSteps(n,t){return this.buildSteps(this.dslDefinition.resolutions,t)}}function hi(s,e){return new Ti(s,e)}class gi extends ei{constructor(n,t,i){var o;super(n,t,i.spellSpeed??1);l(this,"triggers");l(this,"triggerTiming");l(this,"isMandatory");l(this,"selfOnly");l(this,"excludeSelf");l(this,"dslDefinition");this.dslDefinition=i;const a=(o=i.conditions)==null?void 0:o.trigger;this.triggers=(a==null?void 0:a.events)??[],this.triggerTiming=(a==null?void 0:a.timing)??"if",this.isMandatory=(a==null?void 0:a.isMandatory)??!0,this.selfOnly=(a==null?void 0:a.selfOnly)??!1,this.excludeSelf=(a==null?void 0:a.excludeSelf)??!1}buildSteps(n,t){if(!n||n.length===0)return[];const i={cardId:this.cardId,sourceInstanceId:t.instanceId};return n.map(a=>Z(a.step,a.args??{},i))}individualConditions(n,t){var a;const i=(a=this.dslDefinition.conditions)==null?void 0:a.requirements;if(!i||i.length===0)return r.Validation.success();for(const o of i){const d=ee(o.step,n,t,o.args??{});if(!d.isValid)return d}return r.Validation.success()}individualActivationSteps(n,t){return this.buildSteps(this.dslDefinition.activations,t)}individualResolutionSteps(n,t){return this.buildSteps(this.dslDefinition.resolutions,t)}}function Ci(s,e,n){return new gi(s,e,n)}class vi{constructor(e){l(this,"cardId");l(this,"isEffect",!0);this.cardId=e}canApply(e){return this.isOnFieldFaceUp(e)?this.individualConditions(e):!1}isOnFieldFaceUp(e){return[...e.space.mainMonsterZone,...e.space.spellTrapZone,...e.space.fieldZone].some(t=>t.id===this.cardId&&m.Instance.isFaceUp(t))}}const Ii=new Map([]);function Ai(s){const e=Ii.get(s);e&&e()}class Ei extends vi{constructor(n,t){var a;super(n);l(this,"category");l(this,"triggers");l(this,"triggerTiming");l(this,"isMandatory");l(this,"selfOnly");l(this,"dslDefinition");this.dslDefinition=t,this.category=t.category;const i=(a=t.conditions)==null?void 0:a.trigger;this.triggers=(i==null?void 0:i.events)??[],this.triggerTiming=(i==null?void 0:i.timing)??"if",this.isMandatory=(i==null?void 0:i.isMandatory)??!0,this.selfOnly=(i==null?void 0:i.selfOnly)??!1}individualConditions(n){return!0}createTriggerSteps(n,t){const i=this.dslDefinition.resolutions??[],a={cardId:this.cardId,sourceInstanceId:t.instanceId};return i.map(o=>Z(o.step,o.args??{},a))}}class yi{constructor(e){l(this,"cardId");l(this,"isEffect",!0);this.cardId=e}canApply(e){return this.individualConditions(e)}}class Oi extends yi{constructor(n,t){super(n);l(this,"category","ActionOverride");l(this,"overrideName");l(this,"args");l(this,"handler");if(!t.override)throw new Error(`ActionOverride rule for card ID ${n} requires an "override" field`);this.overrideName=t.override,this.args=t.args??{},this.handler=Yn(this.overrideName,n)}individualConditions(n){return!0}shouldApplyOverride(n,t){return this.handler.shouldApply(n,t,this.args)}getOverrideValue(){return this.handler.getOverrideValue(this.args)}}function en(s){var a;let e;try{e=jn.load(s)}catch(o){throw new Ce(o instanceof Error?o.message:"Unknown YAML parse error",void 0,void 0,o instanceof Error?o:void 0)}if(e==null)throw new Ce("YAML content is empty or null");if(typeof e!="object")throw new Ce(`Expected object at root, got ${typeof e}`);const n=e,t=typeof n.id=="number"?n.id:void 0,i=qn.safeParse(e);if(!i.success){const o=i.error.issues.map(p=>`${p.path.join(".")}: ${p.message}`),d=((a=i.error.issues[0])==null?void 0:a.path.join("."))??"unknown";throw new Hn(`Validation failed with ${i.error.issues.length} issue(s)`,t??0,d,o)}return i.data}function nn(s){const{id:e,data:n}=s;K.register(e,{jaName:n.jaName,type:n.type,frameType:n.frameType,monsterTypeList:n.monsterTypeList,spellType:n.spellType,trapType:n.trapType,edition:n.edition??"latest",race:n.race,level:n.level,attack:n.attack,defense:n.defense})}function _i(s){const{id:e,data:n}=s,t=s.effectChainableActions,i=n.spellType;if(t!=null&&t.activations)if(i==="normal"){const a=oi(e,t.activations);E.registerActivation(e,a)}else if(i==="quick-play"){const a=di(e,t.activations);E.registerActivation(e,a)}else if(i==="continuous"){const a=fi(e,t.activations);E.registerActivation(e,a)}else if(i==="equip"){const a=hi(e,t.activations);E.registerActivation(e,a)}else throw new Error(`Unsupported spell type "${i}" for card ID ${e}`);else if(i==="continuous"){const a=_e.createNoOp(e);E.registerActivation(e,a)}else if(i==="field"){const a=Xe.createNoOp(e);E.registerActivation(e,a)}else if(i==="equip"){const a=Oe.createNoOp(e);E.registerActivation(e,a)}t!=null&&t.ignitions&&t.ignitions.forEach((a,o)=>{const d=Si(e,o+1,a);E.registerIgnition(e,d)}),t!=null&&t.triggers&&t.triggers.forEach((a,o)=>{const d=Ci(e,o+1,a);E.registerTrigger(e,d)})}function Ri(s){const{id:e}=s,n=s.effectAdditionalRules;if(n){if(n.continuous)for(const t of n.continuous){const i=new Ei(e,t);fe.register(e,i)}if(n.unclassified){for(const t of n.unclassified)if(t.category==="ActionOverride"){const i=new Oi(e,t);fe.register(e,i)}}}}function tn(s){const e=en(s);nn(e)}function Ni(s){const e=en(s);nn(e),_i(e),Ri(e)}const Di=new Map([]);function bi(s){const e=Di.get(s);e&&e()}const Li=(s,e,n)=>[e,()=>K.register(e,{jaName:n,type:"trap",frameType:"trap",trapType:s,edition:"latest"})],Vi=new Map([Li("normal",83968380,"強欲な瓶")]);function an(s){const e=Vi.get(s);e&&e()}function Pi(s){K.clear();for(const e of s){const n=Ae.get(e);if(n){tn(n);continue}an(e)}}const sn=[24874631];function ki(s){K.clear(),E.clear(),fe.clear();for(const e of sn){const n=Ae.get(e);n&&tn(n)}for(const e of s){const n=Ae.get(e);if(n){Ni(n);continue}an(e),bi(e),Ai(e)}}const Mi=(s,e,n,t,i)=>({success:!0,updatedState:f.checkVictory(s),message:e,emittedEvents:n,activationSteps:t??[],chainBlock:i}),xi=(s,e)=>({success:!1,updatedState:s,error:e,activationSteps:[]}),k={Result:{success:Mi,failure:xi}};class wi{constructor(){l(this,"description");this.description="Advance to next phase"}canExecute(e){if(e.result.isGameOver)return r.Validation.failure(r.Validation.ERROR_CODES.GAME_OVER);const n=f.Phase.next(e.phase);return f.Phase.changeable(e.phase,n).valid?r.Validation.success():r.Validation.failure(r.Validation.ERROR_CODES.PHASE_TRANSITION_NOT_ALLOWED)}execute(e){const n=this.canExecute(e);if(!n.isValid)return k.Result.failure(e,r.Validation.errorMessage(n));const t=f.Phase.next(e.phase),i=f.Phase.isEnd(t)&&e.queuedEndPhaseEffectIds.length>0,a=f.Phase.isEnd(t)?this.resetFieldCardActivatedEffects(e.space):e.space,o={...e,space:a,phase:t,activatedCardIds:f.Phase.isEnd(t)?new Set:e.activatedCardIds,queuedEndPhaseEffectIds:i?[]:e.queuedEndPhaseEffectIds};return k.Result.success(o,`${f.Phase.displayName(t)} です`)}getNextPhase(e){return f.Phase.next(e.phase)}resetFieldCardActivatedEffects(e){const n=t=>{if(!t.stateOnField||t.stateOnField.activatedEffects.size===0)return t;const i={...t.stateOnField,activatedEffects:new Set};return{...t,stateOnField:i}};return{...e,mainMonsterZone:e.mainMonsterZone.map(n),spellTrapZone:e.spellTrapZone.map(n),fieldZone:e.fieldZone.map(n)}}}class de{constructor(e,n){l(this,"description");this.cardInstanceId=e,this.mode=n,this.description=n==="summon"?`Summon monster ${e}`:`Set monster ${e}`}canExecute(e){return e.result.isGameOver?r.Validation.failure(r.Validation.ERROR_CODES.GAME_OVER):Bn(e,this.cardInstanceId)}execute(e){const n=this.canExecute(e);if(!n.isValid)return k.Result.failure(e,r.Validation.errorMessage(n));const t=this.mode==="summon"?"attack":"defense",i=Wn(e,this.cardInstanceId,t);return i.type==="immediate"?k.Result.success(i.state,i.message,void 0,i.activationSteps):k.Result.success(e,i.message,void 0,[i.step])}getCardInstanceId(){return this.cardInstanceId}getMode(){return this.mode}}class Ue{constructor(e){l(this,"description");this.cardInstanceId=e,this.description=`Set spell/trap ${e}`}canExecute(e){if(e.result.isGameOver)return r.Validation.failure(r.Validation.ERROR_CODES.GAME_OVER);if(!f.Phase.isMain(e.phase))return r.Validation.failure(r.Validation.ERROR_CODES.NOT_MAIN_PHASE);const n=f.Space.findCard(e.space,this.cardInstanceId);return n?!m.isSpell(n)&&!m.isTrap(n)?r.Validation.failure(r.Validation.ERROR_CODES.NOT_SPELL_OR_TRAP_CARD):m.Instance.inHand(n)?!m.isFieldSpell(n)&&f.Space.isSpellTrapZoneFull(e.space)?r.Validation.failure(r.Validation.ERROR_CODES.SPELL_TRAP_ZONE_FULL):r.Validation.success():r.Validation.failure(r.Validation.ERROR_CODES.CARD_NOT_IN_HAND):r.Validation.failure(r.Validation.ERROR_CODES.CARD_NOT_FOUND)}execute(e){const n=this.canExecute(e);if(!n.isValid)return k.Result.failure(e,r.Validation.errorMessage(n));const t=f.Space.findCard(e.space,this.cardInstanceId),i={...e,space:this.moveSetSpellTrapCard(e.space,t)};return k.Result.success(i,`${m.nameWithBrackets(t)}をセットします`)}moveSetSpellTrapCard(e,n){if(m.isFieldSpell(n)){const t=f.Space.sendExistingFieldSpellToGraveyard(e);return f.Space.moveCard(t,n,"fieldZone",{position:"faceDown"})}return f.Space.moveCard(e,n,"spellTrapZone",{position:"faceDown"})}getCardInstanceId(){return this.cardInstanceId}}function rn(s,e){if(m.Instance.inHand(e)){if(m.isFieldSpell(e)){const n=f.Space.sendExistingFieldSpellToGraveyard(s);return f.Space.moveCard(n,e,"fieldZone",{position:"faceUp"})}if(m.isSpell(e)||m.isTrap(e))return f.Space.moveCard(s,e,"spellTrapZone",{position:"faceUp"});throw new Error("Invalid card type for activation")}return f.Space.updateCardStateInPlace(s,e,{position:"faceUp"})}class Ye{constructor(e){l(this,"description");this.cardInstanceId=e,this.description=`Activate spell card ${e}`}canExecute(e){if(e.result.isGameOver)return r.Validation.failure(r.Validation.ERROR_CODES.GAME_OVER);const n=f.Space.findCard(e.space,this.cardInstanceId);if(!n)return r.Validation.failure(r.Validation.ERROR_CODES.CARD_NOT_FOUND);if(!m.isSpell(n))return r.Validation.failure(r.Validation.ERROR_CODES.NOT_SPELL_CARD);if(!m.Instance.inHand(n)&&!(m.Instance.onField(n)&&m.Instance.isFaceDown(n)))return r.Validation.failure(r.Validation.ERROR_CODES.CARD_NOT_IN_VALID_LOCATION);if(!m.isFieldSpell(n)&&f.Space.isSpellTrapZoneFull(e.space))return r.Validation.failure(r.Validation.ERROR_CODES.SPELL_TRAP_ZONE_FULL);const t=E.getActivation(n.id);if(!t)return r.Validation.failure(r.Validation.ERROR_CODES.EFFECT_NOT_REGISTERED);const i=t.canActivate(e,n);return i.isValid?r.Validation.success():i}execute(e){const n=this.canExecute(e);if(!n.isValid)return k.Result.failure(e,r.Validation.errorMessage(n));const t=f.Space.findCard(e.space,this.cardInstanceId),i={...e,space:rn(e.space,t),activatedCardIds:f.updatedActivatedCardIds(e.activatedCardIds,t.id)},a=E.getActivation(t.id),o=(a==null?void 0:a.createActivationSteps(i,t))??[],d=(a==null?void 0:a.createResolutionSteps(i,t))??[],p=a?{effectId:a.effectId,sourceInstanceId:t.instanceId,sourceCardId:t.id,spellSpeed:a.spellSpeed,resolutionSteps:d,isNegated:!1}:void 0;return k.Result.success(i,void 0,[],o,p)}getCardInstanceId(){return this.cardInstanceId}}class je{constructor(e){l(this,"description");this.cardInstanceId=e,this.description=`Activate ignition effect of ${e}`}canExecute(e){if(e.result.isGameOver)return r.Validation.failure(r.Validation.ERROR_CODES.GAME_OVER);const n=f.Space.findCard(e.space,this.cardInstanceId);if(!n)return r.Validation.failure(r.Validation.ERROR_CODES.CARD_NOT_FOUND);if(!["fieldZone","spellTrapZone","mainMonsterZone"].includes(n.location))return r.Validation.failure(r.Validation.ERROR_CODES.CARD_NOT_ON_FIELD);if(!m.Instance.isFaceUp(n))return r.Validation.failure(r.Validation.ERROR_CODES.CARD_NOT_FACE_UP);const i=E.getIgnitionEffects(n.id);return i.length===0?r.Validation.failure(r.Validation.ERROR_CODES.NO_IGNITION_EFFECT):this.findActivatableEffect(i,e,n)?r.Validation.success():r.Validation.failure(r.Validation.ERROR_CODES.ACTIVATION_CONDITIONS_NOT_MET)}findActivatableEffect(e,n,t){return e.find(i=>i.canActivate(n,t).isValid)}execute(e){const n=this.canExecute(e);if(!n.isValid)return k.Result.failure(e,r.Validation.errorMessage(n));const t=f.Space.findCard(e.space,this.cardInstanceId),i=E.getIgnitionEffects(t.id),a=this.findActivatableEffect(i,e,t),o=t.stateOnField,d=new Set(o.activatedEffects);d.add(a.effectId);const p={...e,space:f.Space.updateCardStateInPlace(e.space,t,{activatedEffects:d})},c=a.createActivationSteps(p,t),u=a.createResolutionSteps(p,t),S={effectId:a.effectId,sourceInstanceId:t.instanceId,sourceCardId:t.id,spellSpeed:a.spellSpeed,resolutionSteps:u,isNegated:!1};return k.Result.success(p,void 0,[],c,S)}getCardInstanceId(){return this.cardInstanceId}}function Fi(s,e){if(!f.Phase.isMain(s.phase))return r.Validation.failure(r.Validation.ERROR_CODES.NOT_MAIN_PHASE);const n=f.Space.findCard(s.space,e);if(!n)return r.Validation.failure(r.Validation.ERROR_CODES.CARD_NOT_FOUND);if(n.frameType!=="synchro")return r.Validation.failure("NOT_SYNCHRO_MONSTER");if(n.location!=="extraDeck")return r.Validation.failure("CARD_NOT_IN_EXTRA_DECK");const t=n.level??0;return Gi(s.space.mainMonsterZone,t)?r.Validation.success():r.Validation.failure("NO_VALID_SYNCHRO_MATERIALS")}function Gi(s,e){const n=s.filter(a=>m.Instance.isFaceUp(a)),t=n.filter(a=>m.isTuner(a)),i=n.filter(a=>m.isNonTuner(a));return t.length===0||i.length===0?!1:Ui(t,i,e)}function Ui(s,e,n){for(const t of s){const i=t.level??0,a=n-i;if(a>0&&Yi(e,a))return!0}return!1}function Yi(s,e){const n=s.map(i=>i.level??0),t=new Set([0]);for(const i of n){const a=new Set;for(const o of t)a.add(o+i);for(const o of a)t.add(o)}return t.has(e)}function ji(s,e){if(s.length<2)return!1;const n=s.some(a=>m.isTuner(a)),t=s.some(a=>m.isNonTuner(a));return!n||!t?!1:s.reduce((a,o)=>a+(o.level??0),0)===e}function qi(s,e){const n=f.Space.findCard(s.space,e),t=n.level??0,i=We({id:`${n.id}-select-synchro-materials`,summary:"シンクロ素材を選択",description:`チューナー＋非チューナーを選び、レベル合計が ${t} になるようにしてください`,availableCards:null,_sourceZone:"mainMonsterZone",_filter:a=>m.Instance.isFaceUp(a),minCards:2,maxCards:5,cancelable:!0,canConfirm:a=>ji(a,t),onSelect:(a,o)=>{if(o.length===0)return r.Result.failure(a,"シンクロ召喚をキャンセルしました");let d=a.space;const p=[];for(const _ of o){const b=f.Space.findCard(d,_);if(b){const R={...a,space:d};d=Zn(R,b,"graveyard"),p.push(...ke.sentToGraveyard(b))}}const c={...a,space:d},{state:u,event:S}=Kn(c,e,"attack"),h=f.Space.findCard(u.space,e),C=[...p,S,ke.synchroSummoned(h)];return r.Result.success(u,`${m.nameWithBrackets(h)}をシンクロ召喚しました`,C)}});return{type:"needsSelection",message:`${m.nameWithBrackets(n)}のシンクロ素材を選択してください`,step:i}}class qe{constructor(e){l(this,"description");this.cardInstanceId=e,this.description=`Synchro Summon ${e}`}canExecute(e){return e.result.isGameOver?r.Validation.failure(r.Validation.ERROR_CODES.GAME_OVER):Fi(e,this.cardInstanceId)}execute(e){const n=this.canExecute(e);if(!n.isValid)return k.Result.failure(e,r.Validation.errorMessage(n));const t=qi(e,this.cardInstanceId);return k.Result.success(e,t.message,void 0,[t.step])}getCardInstanceId(){return this.cardInstanceId}}function on(){return f.initialize({mainDeckCardIds:[],extraDeckCardIds:[]},K.getCard,{skipShuffle:!0,skipInitialDraw:!0})}const w=pe(on());function Hi(s){const e=[];s.mainDeck.forEach(t=>{for(let i=0;i<t.quantity;i++)e.push(t.id)});const n=[];return s.extraDeck.forEach(t=>{for(let i=0;i<t.quantity;i++)n.push(t.id)}),{mainDeckCardIds:e,extraDeckCardIds:n}}function Bi(s){const e=Hi(s);w.set(f.initialize(e,K.getCard))}function ae(){let s=on();return w.subscribe(n=>{s=n})(),s}function He(){return{isBuilding:!1,stack:[],currentChainNumber:0,lastSpellSpeed:null}}function Wi(){const{subscribe:s,update:e,set:n}=pe(He()),t={subscribe:s,startChain:()=>{e(i=>({...i,isBuilding:!0,currentChainNumber:1}))},pushChainBlock:i=>{e(a=>{const o={...i,chainNumber:a.currentChainNumber};return{...a,stack:[...a.stack,o],currentChainNumber:a.currentChainNumber+1,lastSpellSpeed:i.spellSpeed}})},endChainBuilding:()=>{e(i=>({...i,isBuilding:!1}))},popChainBlock:()=>{const i=g(t);if(i.stack.length===0)return;const a=i.stack[i.stack.length-1];return e(o=>({...o,stack:o.stack.slice(0,-1)})),a},canChain:i=>{const a=g(t);return a.isBuilding?i>=(a.lastSpellSpeed??1):i>=1},getStackedInstanceIds:()=>{const i=g(t);return new Set(i.stack.map(a=>a.sourceInstanceId))},getRequiredSpellSpeed:()=>{const i=g(t);return i.stack.length===0?1:Math.max(2,i.lastSpellSpeed??2)},reset:()=>{n(He())}};return t}const P=Wi();function ce(s,e,n){const t=s.action(e,n);return t.success?(w.set(t.updatedState),{updatedState:t.updatedState,emittedEvents:t.emittedEvents||[],message:t.message}):(console.error("[executeStepAction] Step action failed:",s.id,t.message),{updatedState:e,emittedEvents:[]})}const Zi=async(s,e)=>({shouldContinue:!0,emittedEvents:ce(s,e).emittedEvents}),Ki=async(s,e,n)=>{const t=ce(s,e);return n.notification&&n.notification.showInfo(s.summary,s.description),{shouldContinue:!0,delay:300,emittedEvents:t.emittedEvents}},zi=async(s,e,n)=>{const t=ce(s,e);return n.notification&&t.message&&n.notification.showInfo("",t.message),{shouldContinue:!0,delay:300,emittedEvents:t.emittedEvents}},Qi=async(s,e,n,t)=>{const i=s.cardSelectionConfig;let a;if(i.availableCards!==null)a=i.availableCards;else{if(!i._sourceZone)return console.error("_sourceZone must be specified when availableCards is null"),{shouldContinue:!1};const d=e.space[i._sourceZone],p=i._effectId?e.activationContexts[i._effectId]:void 0;a=i._filter?d.filter((c,u)=>i._filter(c,u,p,d)):d}let o=[];return await new Promise(d=>{t(p=>({...p,cardSelectionConfig:{availableCards:a,minCards:i.minCards,maxCards:i.maxCards,summary:i.summary,description:i.description,cancelable:i.cancelable,canConfirm:i.canConfirm,onConfirm:c=>{const u=g(w);o=ce(s,u,c).emittedEvents,t(h=>({...h,cardSelectionConfig:null})),d()},onCancel:()=>{t(c=>({...c,cardSelectionConfig:null})),d()}}}))}),{shouldContinue:!0,emittedEvents:o}},Xi=async(s,e,n,t)=>{let i=[];return await new Promise(a=>{t(o=>({...o,confirmationConfig:{summary:s.summary,description:s.description,onConfirm:()=>{const d=g(w);i=ce(s,d).emittedEvents,t(c=>({...c,confirmationConfig:null})),a()}}}))}),{shouldContinue:!0,emittedEvents:i}};function Ji(s){const e=s.notificationLevel||"static";return e==="silent"?Zi:e==="static"?Ki:e==="dynamic"?zi:s.cardSelectionConfig?Qi:Xi}function $i(s,e,n,t){const i=[];for(const a of s){const o=fe.collectTriggerSteps(e,a);i.push(...o);const d=E.collectTriggerSteps(e,a,p=>{P.pushChainBlock(p)});i.push(...d)}return i.length===0?n:[...n.slice(0,t+1),...i,...n.slice(t+1)]}function ea(){const{subscribe:s,update:e}=pe({isActive:!1,currentStep:null,steps:[],currentIndex:-1,notificationHandler:null,confirmationConfig:null,cardSelectionConfig:null,chainConfirmationConfig:null,eventTimeline:r.TimeLine.createEmptyTimeline()}),n=c=>{e(S=>({...S,isActive:!0,steps:c,currentIndex:0,currentStep:c[0]||null})),c[0]&&t()},t=async()=>{let c=g(p);if(!c.currentStep)return;if(zn(c.currentStep)){e(_=>({..._,eventTimeline:r.TimeLine.advanceTime(_.eventTimeline)})),i(c,e)&&t();return}const u=g(w),h=await Ji(c.currentStep)(c.currentStep,u,{notification:c.notificationHandler},e);if(h.emittedEvents&&h.emittedEvents.length>0){let C=c.eventTimeline;for(const R of h.emittedEvents)C=r.TimeLine.recordEvent(C,R);const _=g(w),b=$i(h.emittedEvents,_,c.steps,c.currentIndex);e(R=>({...R,steps:b,eventTimeline:C})),c=g(p)}h.delay&&await new Promise(C=>setTimeout(C,h.delay)),h.shouldContinue&&i(c,e)&&t()};function i(c,u){const S=c.currentIndex+1;return S<c.steps.length?(u(h=>({...h,currentIndex:S,currentStep:h.steps[S]})),!0):(a(u),!1)}function a(c){c(S=>({...S,isActive:!1,currentStep:null,steps:[],currentIndex:-1}));const u=g(P);if(u.stack.length>0)if(u.isBuilding){const S=g(w),h=P.getRequiredSpellSpeed(),C=P.getStackedInstanceIds(),_=E.collectChainableActions(S,h,C);if(_.length>0){c(b=>({...b,chainConfirmationConfig:{chainableCards:_,onActivate:R=>{const q=_.find(me=>me.instance.instanceId===R);q&&p.activateChain(q.instance,q.action)},onPass:()=>{c(R=>({...R,chainConfirmationConfig:null})),o()}}}));return}setTimeout(()=>{o()},0)}else setTimeout(()=>{d()},0);else P.reset()}const o=()=>{P.endChainBuilding(),d()};function d(){const c=P.popChainBlock();if(!c){P.reset();return}!c.isNegated&&c.resolutionSteps.length>0?(e(u=>({...u,isActive:!0,steps:c.resolutionSteps,currentIndex:0,currentStep:c.resolutionSteps[0]||null})),t()):d()}const p={subscribe:s,registerNotificationHandler:c=>{e(u=>({...u,notificationHandler:c}))},handleEffectQueues:(c,u)=>{c&&(g(P).stack.length===0&&P.startChain(),P.pushChainBlock(c)),u&&u.length>0?n(u):c&&o()},activateChain:(c,u)=>{if(!P.canChain(u.spellSpeed)){console.warn("Invalid chain attempt: Spell speed too low.");return}e(b=>({...b,chainConfirmationConfig:null}));const S=g(w),h={...S,space:rn(S.space,c),activatedCardIds:f.updatedActivatedCardIds(S.activatedCardIds,c.id)};w.set(h);const C=u.createActivationSteps(h,c),_=u.createResolutionSteps(h,c);P.pushChainBlock({sourceInstanceId:c.instanceId,sourceCardId:c.id,effectId:u.effectId,spellSpeed:u.spellSpeed,resolutionSteps:_,isNegated:!1}),C.length>0?n(C):a(e)}};return p}const na=ea();class ta{canExecuteCommand(e,...n){const t=ae();return new e(...n).canExecute(t).isValid}executeCommand(e,...n){const t=ae(),a=new e(...n).execute(t);return a.success&&this.applyCommandResult(a),a}applyCommandResult(e){w.set(e.updatedState),na.handleEffectQueues(e.chainBlock,e.activationSteps)}loadDeck(e){const n=Me(e),t=xe(n);return Pi(t),{deckData:we(n,t),uniqueCardIds:t}}initializeGame(e){const n=Me(e),t=xe(n);ki(t);const i=we(n,t);this.startGame(n);const a=[...t,...sn];return{deckData:i,uniqueCardIds:a}}startGame(e){Bi(e)}getGameState(){return ae()}findCardOnField(e){const n=ae();return[...n.space.mainMonsterZone,...n.space.spellTrapZone,...n.space.fieldZone].find(i=>i.instanceId===e)}advancePhase(){return this.executeCommand(wi)}async autoAdvanceToMainPhase(e,n){const t=ae();if(t.turn!==1||t.phase!=="draw")return!1;for(let i=0;i<2;i++){e&&await e();const a=this.advancePhase();if(a.success)a.message&&n&&n(a.message);else return console.error(`[GameFacade] Auto advance failed: ${a.error}`),!1}return!0}canSummonMonster(e){return this.canExecuteCommand(de,e,"summon")}summonMonster(e){return this.executeCommand(de,e,"summon")}canSetMonster(e){return this.canExecuteCommand(de,e,"set")}setMonster(e){return this.executeCommand(de,e,"set")}canSetSpellTrap(e){return this.canExecuteCommand(Ue,e)}setSpellTrap(e){return this.executeCommand(Ue,e)}canActivateSpell(e){return this.canExecuteCommand(Ye,e)}activateSpell(e){return this.executeCommand(Ye,e)}canActivateIgnitionEffect(e){return this.canExecuteCommand(je,e)}activateIgnitionEffect(e){return this.executeCommand(je,e)}canSynchroSummon(e){return this.canExecuteCommand(qe,e)}synchroSummon(e){return this.executeCommand(qe,e)}}const Xa=new ta;function ia(){return{credentials:"same-origin"}}async function aa(s,e,n){try{return await s(e,n)}catch(t){throw console.error("API error:",t),new Error(`Failed to fetch: ${n.method} ${e}`)}}const sa=ne({id:se(),image_url:T(),image_url_small:T(),image_url_cropped:T()}),ra=ne({set_name:T(),set_code:T(),set_rarity:T(),set_rarity_code:T(),set_price:T()}),oa=ne({cardmarket_price:T(),tcgplayer_price:T(),ebay_price:T(),amazon_price:T(),coolstuffinc_price:T()}),ca=ne({ban_tcg:T().optional(),ban_ocg:T().optional(),ban_goat:T().optional()}),la=ne({id:se(),name:T(),type:T(),humanReadableCardType:T(),frameType:T(),desc:T(),race:T(),ygoprodeck_url:T(),archetype:T().optional(),typeline:re(T()).optional(),atk:se().optional(),def:se().optional(),level:se().optional(),attribute:T().optional(),banlist_info:ca.optional(),card_images:re(sa),card_sets:re(ra).optional(),card_prices:re(oa).optional()}),da=ne({data:re(la)});function cn(s){const e=s.card_images[0];return{id:s.id,name:s.name,type:s.type,frameType:s.frameType,desc:s.desc,archetype:s.archetype,atk:s.atk,def:s.def,level:s.level,attribute:s.attribute,race:s.type.toLowerCase().includes("monster")?s.race:void 0,images:e?{image:e.image_url,imageSmall:e.image_url_small,imageCropped:e.image_url_cropped}:null}}const ua="https://db.ygoprodeck.com/api/v7",ln="cardinfo.php",Be=new Map;async function dn(s,e){const t={...ia(),method:"GET"},i=`${ua}/${e}`;try{const a=await aa(s,i,t);if(!a.ok){if(console.error(`YGOPRODeck API Error: ${a.status} ${a.statusText} - ${i}`),a.status===429)throw new Error("YGOPRODeck API rate limit exceeded. Please reduce request frequency.");return null}const o=await a.json();return da.parse(o)}catch(a){throw a instanceof Qn?console.error("YGOPRODeck API response validation failed:",a.issues):console.error("YGOPRODeck API fetch failed:",a),a}}async function fa(s,e){const n=`${ln}?id=${e}`,t=await dn(s,n),i=t==null?void 0:t.data[0];return i?cn(i):null}async function pa(s,e){if(e.length===0)return[];const n=[],t=[];for(const a of e){const o=Be.get(a);o?n.push(o):t.push(a)}let i=[];if(t.length>0){const a=t.join(","),o=`${ln}?id=${a}`,d=await dn(s,o);if(d!=null&&d.data){i=d.data;for(const p of i)Be.set(p.id,p)}}return[...n,...i].map(cn)}class ma{async getCardsByIds(e,n){return pa(e,n)}async getCardById(e,n){const t=await fa(e,n);if(!t)throw new Error(`Card not found: ID ${n}`);return t}}let Ie=null;function Sa(){return Ie||(Ie=new ma),Ie}function Ta(s){const e=s.toLowerCase();return e.includes("monster")?"monster":e.includes("spell")?"spell":e.includes("trap")?"trap":null}function ha(s){return s.toLowerCase()}function ga(s,e){const n=`${e.jaName} (ID: ${e.id})`,t=Ta(s.type);t&&t!==e.type&&console.warn(`[CardData Mismatch] ${n}: type が一致しません。Domain="${e.type}", API="${t}" (raw: "${s.type}")`);const i=ha(s.frameType);i!==e.frameType&&console.warn(`[CardData Mismatch] ${n}: frameType が一致しません。Domain="${e.frameType}", API="${i}" (raw: "${s.frameType}")`)}function Ca(s,e){ga(s,e);const n=e.type==="monster"&&s.atk!==void 0&&s.def!==void 0&&s.level!==void 0?{attack:s.atk,defense:s.def,level:s.level,attribute:s.attribute??"",race:s.race??""}:void 0;return{id:e.id,name:s.name,jaName:e.jaName,type:e.type,description:s.desc,frameType:e.frameType,edition:e.edition,archetype:s.archetype,monsterAttributes:n,images:s.images??void 0}}function va(s){const e=K.get(s.id);return Ca(s,e)}function Ia(s){return s.map(e=>va(e))}const Aa={isInitialized:!1,isLoading:!1,error:null,data:new Map},U=pe(Aa),Ea=Sa();async function Ja(s){const e=g(U);if(!(e.isInitialized&&s.every(n=>e.data.has(n)))){U.update(n=>({...n,isLoading:!0,error:null}));try{const n=s.filter(t=>!e.data.has(t));if(n.length>0){const t=await Ea.getCardsByIds(fetch,n),i=Ia(t);U.update(a=>{const o=new Map(a.data);return i.forEach(d=>{o.set(d.id,d)}),{...a,isInitialized:!0,isLoading:!1,data:o}})}else U.update(t=>({...t,isInitialized:!0,isLoading:!1}))}catch(n){const t=n instanceof Error?n.message:"Failed to initialize display card data cache";throw console.error("[displayCardDataCache] Initialization error:",n),U.update(i=>({...i,isLoading:!1,error:t})),n}}}function $a(s){return g(U).data.get(s)}const es={subscribe:U.subscribe,get isInitialized(){return g(U).isInitialized},get isLoading(){return g(U).isLoading},get error(){return g(U).error}},ya={small:"w-16 h-24",medium:"w-22 h-32",large:"w-32 h-48"},Oa={small:"w-4 h-4 text-xs",medium:"w-6 h-6 text-xs",large:"w-8 h-8 text-sm"},_a=""+new URL("../assets/CardBack.DGn8cQOG.jpg",import.meta.url).href;var Ra=D('<div class="w-full h-full flex items-center justify-center p-1"><img alt="裏向きカード" class="w-full h-full object-cover rounded-sm"/></div>'),Na=D('<img class="w-full h-full object-cover rounded-sm"/>'),Da=D('<span class="text-xs opacity-75 select-none mt-1"> </span>'),ba=D('<div class="w-full h-full bg-surface-200-700-token rounded-sm flex flex-col items-center justify-center text-center overflow-hidden"><img class="w-full h-full object-cover opacity-30"/> <div class="absolute inset-0 flex flex-col items-center justify-center"><span class="text-xs select-none text-surface-600-300-token font-medium"> </span> <!></div></div>'),La=D('<div class="w-full h-full bg-surface-200-700-token rounded-sm flex items-center justify-center"><img alt="" class="w-full h-full object-cover opacity-20"/> <div class="absolute inset-0 flex items-center justify-center"><span class="text-xs opacity-50 select-none">No Image</span></div></div>'),Va=D('<div class="px-1 py-1 bg-surface-50-900-token border-t border-surface-300"><div class="text-xs font-medium truncate"> </div></div>'),Pa=D('<div class="flex-1 flex items-center justify-center p-1"><!></div> <!>',1),ka=D('<div class="absolute top-1 right-1 w-3 h-3 bg-primary-500 rounded-full animate-pulse"></div>'),Ma=D('<div title="装備カード付き"><!></div>'),xa=D('<div class="absolute inset-0 bg-primary-500 opacity-10 pointer-events-none"></div>'),wa=D("<!> <!> <!> <!>",1),Fa=D("<button><!></button>"),Ga=D("<div><!></div>");function ns(s,e){Ke(e,!0);const n=A=>{var M=wa(),z=ve(M);{var te=v=>{var y=Ra(),H=L(y);V(y),j(()=>$(H,"src",Se)),O(v,y)},An=v=>{var y=Pa(),H=ve(y),Rn=L(H);{var Nn=F=>{var x=Na();j(()=>{$(x,"src",e.card.images.imageCropped),$(x,"alt",e.card.jaName||"カード")}),O(F,x)},Dn=(F,x)=>{{var B=Q=>{var W=ba(),ie=L(W),Pe=J(ie,2),he=L(Pe),Vn=L(he,!0);V(he);var Pn=J(he,2);{var kn=ge=>{var X=Da(),Mn=L(X,!0);V(X),j(()=>ue(Mn,e.card.type)),O(ge,X)};Y(Pn,ge=>{var X;(X=e.card)!=null&&X.type&&ge(kn)})}V(Pe),V(W),j(()=>{$(ie,"src",Se),$(ie,"alt",p()),ue(Vn,p())}),O(Q,W)},Te=Q=>{var W=La(),ie=L(W);$n(2),V(W),j(()=>$(ie,"src",Se)),O(Q,W)};Y(F,Q=>{I(Re)?Q(B):Q(Te,!1)},x)}};Y(Rn,F=>{var x,B;(B=(x=e.card)==null?void 0:x.images)!=null&&B.imageCropped?F(Nn):F(Dn,!1)})}V(H);var bn=J(H,2);{var Ln=F=>{var x=Va(),B=L(x),Te=L(B,!0);V(B),V(x),j(()=>ue(Te,e.card.jaName)),O(F,x)};Y(bn,F=>{e.card&&!I(Re)&&F(Ln)})}O(v,y)};Y(z,v=>{h()?v(An,!1):v(te)})}var Le=J(z,2);{var En=v=>{var y=ka();O(v,y)};Y(Le,v=>{I(q)&&v(En)})}var Ve=J(Le,2);{var yn=v=>{var y=Ma(),H=L(y);et(H,{icon:"mdi:plus-circle-outline",class:"size-8 md:size-12 text-white"}),V(y),j(()=>Qe(y,1,`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full shadow-md z-10 transition-opacity duration-200 ${_()?"opacity-100":"opacity-75"}`)),O(v,y)};Y(Ve,v=>{C()&&v(yn)})}var On=J(Ve,2);{var _n=v=>{var y=xa();O(v,y)};Y(On,v=>{u()&&(I(b)||I(q))&&v(_n)})}O(A,M)};let t=N(e,"size",3,"medium"),i=N(e,"clickable",3,!1),a=N(e,"selectable",3,!1),o=N(e,"isSelected",3,!1),d=N(e,"placeholder",3,!1),p=N(e,"placeholderText",3,"カード"),c=N(e,"rotation",3,0),u=N(e,"animate",3,!0),S=N(e,"showDetailOnClick",3,!1),h=N(e,"faceUp",3,!0),C=N(e,"isEquipped",3,!1),_=N(e,"isEquipmentHovered",3,!1),b=Fe(!1),R=Fe(!1),q=G(()=>a()?I(R):o());Jn(()=>{a()||le(R,o())});function me(){var A;console.log(`[Card] クリックイベント発生: clickable=${i()}, card=${(A=e.card)==null?void 0:A.jaName}, hasOnClick=${!!e.onClick}`),i()&&e.card&&e.onClick&&(console.log(`[Card] onClickコールバックを実行します: ${e.card.jaName}`),e.onClick(e.card)),a()&&le(R,!I(R)),S()&&e.card&&it(e.card)}function un(){le(b,!0),e.onHover&&e.card&&e.onHover(e.card)}function fn(){le(b,!1),e.onHover&&e.onHover(null)}const Re=G(()=>d()||!e.card),Se=_a,pn=G(()=>u()?"transition-all duration-300 ease-in-out":""),mn=G(()=>i()||a()||S()?"cursor-pointer hover:scale-105 hover:shadow-lg":""),Sn=G(()=>I(q)?"ring-2 ring-primary-500 shadow-lg":""),Tn=G(()=>c()!==0?`transform: rotate(${c()}deg);`:""),hn=G(()=>{var A;return nt((A=e.card)==null?void 0:A.frameType)}),gn=G(()=>{var A;return tt((A=e.card)==null?void 0:A.edition)}),Ne=G(()=>()=>`
      ${ya[t()]}
      ${I(pn)}
      ${I(mn)}
      ${I(Sn)}
      ${I(hn)}
      ${I(gn)}
      border rounded aspect-[3/4] flex flex-col justify-between
      relative overflow-hidden
    `),De=G(()=>({style:I(Tn),onclick:i()||a()||S()?me:void 0,onmouseenter:un,onmouseleave:fn}));var be=Xn(),Cn=ve(be);{var vn=A=>{var M=Fa();Ge(M,te=>({class:`${te??""} bg-transparent p-0 border border-2 border-gray-100`,...I(De)}),[()=>I(Ne)()]);var z=L(M);n(z),V(M),O(A,M)},In=A=>{var M=Ga();Ge(M,te=>({class:te,role:"img",...I(De)}),[()=>I(Ne)()]);var z=L(M);n(z),V(M),O(A,M)};Y(Cn,A=>{i()||a()||S()?A(vn):A(In,!1)})}O(s,be),ze()}var Ua=D("<div> </div>");function ts(s,e){Ke(e,!0);let n=N(e,"size",3,"medium"),t=N(e,"colorClasses",3,"bg-primary-200 text-primary-900");var i=Ua(),a=L(i,!0);V(i),j(()=>{Qe(i,1,`absolute -top-2 -right-2 ${Oa[n()]??""} ${t()??""} rounded-full flex items-center justify-center font-bold shadow-md z-10`),ue(a,e.count)}),O(s,i),ze()}export{ns as C,$a as a,ts as b,w as c,es as d,ya as e,_a as f,Xa as g,na as h,Ja as i};
