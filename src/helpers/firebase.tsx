import { initializeApp } from "firebase/app";
import { getDatabase, ref, child, get, onValue, DatabaseReference  } from "firebase/database";

class SaDatabase {
  dbRef: DatabaseReference

  constructor(){
    const firebaseConfig = {
      databaseURL: "https://warpg-f9069-default-rtdb.firebaseio.com",
    };
    
    const app = initializeApp(firebaseConfig);
    const database = getDatabase(app);

    this.dbRef = ref(database, 'game');
    
  }

  consume(fn: (data: any) => void){
    get(this.dbRef).then((snapshot) => {
      if (snapshot.exists()) {
        fn(snapshot.val())
      } else {
        console.log("No data available");
      }
    }).catch((error) => {
      console.error(error);
    });
  }

  update(fn: (data: any) => void){
    onValue(this.dbRef, (snapshot) => {
      const data = snapshot.val();
      if (data){
        fn(data)
      }
    });
  }

}

const SaDB = new SaDatabase()

export default SaDB