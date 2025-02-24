import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, child, get, onValue, DatabaseReference, set, Database, update, onChildAdded, runTransaction, remove  } from "firebase/database";
import { Auth, User, UserCredential, getAuth, onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import * as BdMask from "../helpers/mask"

interface AppProps {
  gameData?: any,
  users?: any,
  tokens?: any,
  messages?: any,
  user?: User | null;
  userData?: any;
  userTokenData?: any,
  userTokens?: any[];
  userCurrentToken?: any;
  windowSize?: {width: number, height: number};
  login?: (user: string, password: string) => Promise<UserCredential | boolean>;
  updateToken?: (data: userModel, token: string) => void;
  duplicateMonsterToken?: (slug: string) => void;
  deleteToken?: (slug: string) => void;
  addPP?: (slug: string) => void;
  subtractPP?: (slug: string) => void;
  setAttr?: (attr: 'pv'|'pm'|'mpv', slug: string, val: string|null) => void;
  updateCurrentMap?: (map: string, night: boolean) => void;
  updateScene?: (sceneVisible: boolean, night: boolean, nigthScene: boolean) => void,
  updateDoom?: (doomEnabled: boolean, doom: string) => void,
  sendMessage?: (token: any, message: string, dices: any, firstResult: any, secondResult: any, target?: any, damage?: any, shield?: any, bonus?: any, buff?: boolean, item?: boolean, effect?: any, dices2?: any, message2?: string) => void;
  changeCurrentToken?: (token: string) => void,
  isSheetOpen?: boolean,
  setIsSheetOpen?: (open: boolean) => void,
  isCardsOpen?: boolean,
  setIsCardsOpen?: (open: boolean) => void,
  audioContext?: any,
  audioFiles?: string[],
  updateItemQuantity?: (index: number, quantity: number) => void,
  changeTerrain?: (index: number, terrain: string) => void,
}

const AppContext = createContext<AppProps>({});

export type userModel = {
  name?: string,
  class?: string,
  level?: number,
  money?: string,
  attr?: {
    pv?: string,
    pvmax?: string,
    pm?: string,
    pmmax?: string,
    mv?: string,
    al?: string,
    df?: string,
    dif?: string,
  },
  combat?:{
    solo?: string,
    partner?: string,
    group?: string,
  },
  stress?:{
    body?: string,
    mind?: string,
  },
  complications?: string[],
  habilities?: string[],
  distinctions?: string[],
  equips?: string[],
  position?: number,
  scene?: string,
}

export const useApp = () => {
  return useContext(AppContext);
}

export const AppProvider = ({children}: any) => {
  const database = useRef<Database>() 
  const auth = useRef<Auth>()
  const gameRef = useRef<DatabaseReference>() 
  const usersRef = useRef<DatabaseReference>() 
  const tokensRef = useRef<DatabaseReference>() 
  const chatRef = useRef<DatabaseReference>() 
  
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isCardsOpen, setIsCardsOpen] = useState(false)
  const [gameData, setGameData] = useState<any>()
  const [users, setUsers] = useState<any>()
  const [tokens, setTokens] = useState<any>()
  const [messages, setMessages] = useState<any[]>([])
  const [user, setUser] = useState<User | null>()
  const [userData, setUserData] = useState<any>()
  const [userTokenData, setUserTokenData] = useState<any>()
  const [userTokens, setUserTokens] = useState<any>()
  const [userCurrentToken, setUserCurrentToken] = useState<any>()
  const [audioContext, setAudioContext] = useState<any>();
  const [audioFiles, setAudioFiles] = useState([ "keyboard.mp3", 'error.mp3', 'success.mp3', 'critical.mp3', 'hit.mp3', 'heal.mp3', 'dices.mp3' ]);
  const [newMessage, setNewMessage] = useState<any>()
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    setAudioContext(new window.AudioContext());
  },[])

  useEffect(() => {
    if (newMessage){
      setMessages([...messages, newMessage])
    }
  },[newMessage])


  useEffect(() => {
    const firebaseConfig = {
      databaseURL: "https://warpg-f9069-default-rtdb.firebaseio.com",
      apiKey: 'AIzaSyCCkoyNv1E5b38IFEviNLNv2mpQUX2kM20'
    };
    
    const app = initializeApp(firebaseConfig);
    database.current = getDatabase(app);
    gameRef.current = ref(database.current, 'game')
    usersRef.current = ref(database.current, 'users')
    tokensRef.current = ref(database.current, 'tokens')
    chatRef.current = ref(database.current, 'chat')
    auth.current = getAuth(app)
  },[])

  useEffect(() => {
    if (users && tokens && user){
      const tks = users[user.uid].tokens.split(',')

      let activeToken = userCurrentToken

      if (!activeToken){
        setUserCurrentToken(tks[0])
        activeToken = tks[0]
      }
      
      setUserData(users[user.uid])
      setUserTokens(tks)
      setUserTokenData(tokens[activeToken])
    }
  }, [users, tokens, user])

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    
    window.addEventListener("resize", handleResize);
     
    handleResize();
    
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const consume = (reference: DatabaseReference, fn: (data: any) => void) => {
    if (reference){
      get(reference).then((snapshot) => {
        if (snapshot.exists()) {
          fn(snapshot.val())
        } else {
          console.log("No data available");
        }
      }).catch((error) => {
        console.error(error);
      });
    }
    
  }

  const observe = (reference: DatabaseReference, fn: (data: any) => void) => {
    if (reference){
      onValue(reference, (snapshot) => {
        const data = snapshot.val();
        if (data){
          fn(data)
        }
      });
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    return new Promise(async (resolve,reject) => {
      if (auth.current){
        try {
          const userCredential: UserCredential = await signInWithEmailAndPassword(auth.current, email, password)

          if (userCredential.user){
            onChildAdded(chatRef.current, (data) => {
              data = data.val()
    
              if (data){
                setNewMessage(data)
              }
            });
        
            const updateGameData = (data: any) => {
              setGameData(data)
            }
        
            const updateUsers = (data: any) => {
              setUsers(data)
            }
        
            const updateTokens = (data: any) => {
              setTokens(data);
            }
        
            consume(gameRef.current, updateGameData)
            observe(gameRef.current, updateGameData)
        
            consume(usersRef.current, updateUsers)
            observe(usersRef.current, updateUsers)
        
            consume(tokensRef.current, updateTokens)
            observe(tokensRef.current, updateTokens)
    
            setUser(userCredential.user)

            resolve(true)
          }
          else{
            reject(false)  
          }
        }
        catch{
          reject(false)  
        }
      }
      else{
        reject(false)
      }
    })
    
  }

  const duplicateMonsterToken = (slug: string) => {
    const newSlug = slug + '_copy'

    if (database.current && tokens && tokens[slug] && typeof(tokens[newSlug]) === 'undefined'){
      let objToInsert: any = {}
      
      objToInsert[newSlug] = tokens[slug]
      objToInsert[newSlug].slug = newSlug

      update(ref(database.current, 'tokens'), objToInsert);
    }
  }

  const deleteToken = (slug: string) => {
    if (database.current && tokens && tokens[slug]){
      remove(ref(database.current, 'tokens/'+slug));
    }
  }

  const updateItemQuantity = (index: number, quantity: number ) => {
    if (database.current && tokens && tokens[userCurrentToken] ){
      let newObj = tokens[userCurrentToken].items

      newObj[index] = newObj[index].split(':::')[0] + ':::' + quantity;

      update(ref(database.current, 'tokens/'+userCurrentToken+'/items'), Object.assign({},newObj));
    }
  }

  const setAttr = (attr: 'pv'|'pm'|'mpv', slug : string, val: string|null) => {
    if (database.current && tokens && tokens[slug] && val && !isNaN(val)){
      let newObj = tokens[slug].attr

      if (val.trim().indexOf('+') === 0 || val.trim().indexOf('-') === 0) {
        newObj[attr] = (parseInt(newObj[attr]) + parseInt(val)).toString();
      } else {
        newObj[attr] = parseInt(val).toString();
      }

      update(ref(database.current, 'tokens/'+slug+'/attr'), newObj);
    }
  }

  const addPP = (slug: string) => {
    if (database.current && tokens && tokens[slug]){
      const newPP = parseInt(tokens[slug].attr?.pp ? tokens[slug].attr.pp : 0) + 1;

      let newObj = tokens[slug].attr
      newObj['pp'] = newPP

      update(ref(database.current, 'tokens/'+slug+'/attr'), newObj);
    }
  }

  const subtractPP = (slug: string) => {
    if (database.current && tokens && tokens[slug]){
      const newPP = parseInt(tokens[slug].attr?.pp ? tokens[slug].attr.pp : 0) - 1;

      let newObj = tokens[slug].attr
      newObj['pp'] = newPP

      update(ref(database.current, 'tokens/'+slug+'/attr'), newObj);
    }
  }

  const updateToken = (data: userModel, token: string) => {
    if (database.current && userCurrentToken && userData){
      update(ref(database.current, 'tokens/' + token), data);
    }
  }

  const sendMessage = (token: any, message: string, dices: any, firstResult: any, secondResult: any, target: any = null, damage: any = null, shield: any = null, bonus: any = null, buff: boolean = false, item: boolean = false, effect: number = 0, dices2: any = null, message2: string = '') => {
    if (userData && user && users && database.current && message && token){
      try{
        const time = new Date().getTime()
        const username = userData.name

        let obj: any = {
          message: message,
          author: user.uid,
          token: token,
          firstResult: firstResult,
          secondResult: secondResult,
          date: BdMask.maskDate(new Date(), true),
          name: username
        }

        if (dices){
          obj.dices = {
            d4: dices.d4,
            d6: dices.d6,
            d8: dices.d8,
            d10: dices.d10,
            d12: dices.d12,
          }
        }

        if (target) {
          obj.target = target;
        }

        if (damage){
          obj.damage = damage;
        }

        if (shield){
          obj.shield = shield;
        }

        if (bonus){
          obj.bonus = bonus;
        }

        if (buff) {
          obj.buff = true;
        }

        if (item) {
          obj.item = true;
        }

        if (effect) {
          obj.effect = effect;
        }

        if (dices2) {
          obj.dices2 = dices2;
        }
        
        if (message2) {
          obj.message2 = message2;
        }

        set(ref(database.current, 'chat/' + time), obj);
      }
      catch(e){
        console.log(e)
      }
      
    }    
  }

  const updateCurrentMap = (map: string, night: boolean) => {
    if (database.current && userData && tokensRef.current){

      runTransaction(ref(database.current, 'tokens'), (tokenList) => {
        if (tokenList){
          Object.keys(tokenList).forEach((key, index) => {
            tokenList[key].position = -1
          })
        }

        return tokenList;
      });

      update(ref(database.current, 'game/map'), {
        current: map,
      });

      console.log(night);
      update(ref(database.current, 'game/maps/' + map), {
        night: night
      });
    }
  }

  const changeTerrain = (index: number, terrain: string) => {
    if (database.current && gameData){
      let active_scene = gameData.maps[gameData.map.current];

      if ( ! active_scene.terrain ) {
        active_scene.terrain = '0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0';
      }

      let new_terrain = active_scene.terrain.split(',');

      if (parseInt(terrain) == 2) {
        terrain += '|Deslizar';
      }

      if (parseInt(terrain) == 3) {
        const dano = prompt('Informe o dano de fogo');

        if ( ! dano ) {
          return;
        }

        terrain += '|Dano (' + dano + ')';
      }

      if (parseInt(terrain) == 4){
        terrain += '|Movimento (-1)';
      }

      new_terrain[index] = terrain;

      console.log(index, terrain, new_terrain[index]);

      active_scene.terrain = new_terrain.join(',');

      update(ref(database.current, 'game/maps/' + gameData.map.current), active_scene);
    }
  }

  const updateScene = (sceneVisible: boolean, night: boolean, nigthScene: boolean) => {
    if (database.current && userData && tokensRef.current){
      update(ref(database.current, 'game/map'), {
        scene_visible: sceneVisible,
        night: night,
        night_scene: nigthScene
      });
    }
  }

  const updateDoom = (doomEnabled: boolean, doom: string) => {
    if (database.current && userData && tokensRef.current){
      update(ref(database.current, 'game/map'), {
        doom_enabled: doomEnabled,
        doom: doom,
      });
    }
  }

  const changeCurrentToken = (token: string) => {
    setUserCurrentToken(token)
    setUserTokenData(tokens[token])
  }

  const value = {
    gameData,
    users,
    tokens,
    messages,
    user,
    userData,
    userTokenData,
    userTokens,
    userCurrentToken,
    windowSize,
    login,
    updateToken,
    duplicateMonsterToken,
    deleteToken,
    addPP,
    subtractPP,
    updateCurrentMap,
    updateScene,
    updateDoom,
    sendMessage,
    changeCurrentToken,
    isSheetOpen,
    setIsSheetOpen,
    isCardsOpen,
    setIsCardsOpen,
    setAttr,
    audioContext,
    audioFiles,
    updateItemQuantity,
    changeTerrain
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}