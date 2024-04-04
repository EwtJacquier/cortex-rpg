import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, child, get, onValue, DatabaseReference, set, Database, update, onChildAdded, runTransaction  } from "firebase/database";
import { Auth, User, UserCredential, getAuth, onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";

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
  updateToken?: (data: userModel, token?: string) => void;
  updateCurrentMap?: (map: string, scene: string) => void;
  sendMessage?: (message: string) => void;
}

const AppContext = createContext<AppProps>({});

type userModel = {
  name?: string,
  class?: string,
  level?: number,
  money?: string,
  attr?: {
    def?: string,
    atk?: string,
    pow?: string
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
  comp?: string,
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
  
  const [gameData, setGameData] = useState<any>()
  const [users, setUsers] = useState<any>()
  const [tokens, setTokens] = useState<any>()
  const [messages, setMessages] = useState<object[]>([])
  const [user, setUser] = useState<User | null>()
  const [userData, setUserData] = useState<any>()
  const [userTokenData, setUserTokenData] = useState<any>()
  const [userTokens, setUserTokens] = useState<any>()
  const [userCurrentToken, setUserCurrentToken] = useState<any>()
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });


  useEffect(() => {

  }, tokens)

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
    
    onAuthStateChanged(auth.current, (user) => {
      if (user) {
        onChildAdded(chatRef.current, (data) => {
          setMessages([messages, ...[data]])
        });
    
        const updateGameData = (data: any) => {
          setGameData(data)
        }
    
        const updateUsers = (data: any) => {
          setUsers(data)
        }
    
        const updateTokens = (data: any) => {
          setTokens(data)
        }
    
        consume(gameRef.current, updateGameData)
        observe(gameRef.current, updateGameData)
    
        consume(usersRef.current, updateUsers)
        observe(usersRef.current, updateUsers)
    
        consume(tokensRef.current, updateTokens)
        observe(tokensRef.current, updateTokens)

        setUser(user)
      } else {
        setUser(null)
        setUserData(null)
        setUserTokens(null)
        setUserCurrentToken(null)
        setUserTokenData(null)
      }
    });
    
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

  const login = async (email: string, password: string): Promise<UserCredential | boolean> => {
    return new Promise(async (resolve,reject) => {
      if (auth.current){
        try {
          const userCredential: UserCredential = await signInWithEmailAndPassword(auth.current, email, password)

          resolve(userCredential)
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

  const updateToken = (data: userModel, token?: string) => {
    console.log('aqui')
    if (database.current && userCurrentToken && userData){
      update(ref(database.current, 'tokens/' + (userData.type === 'gm' && token ? token : userCurrentToken)), data);
    }
  }

  const sendMessage = (message: string) => {
    if (userData && user && users && database.current){
      try{
        const time = new Date().getTime()
        const username = userData.name
  
        set(ref(database.current, 'chat/' + time), {
          message: message,
          author: user.uid,
          name: username
        });
      }
      catch{

      }
      
    }    
  }

  const updateCurrentMap = (map: string, scene: string) => {
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
        current: map
      });

      update(ref(database.current, 'game/maps/' + map), {
        active_scene: scene
      });
    }
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
    updateCurrentMap,
    sendMessage
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}