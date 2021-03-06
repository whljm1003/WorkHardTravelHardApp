import { StatusBar } from "expo-status-bar";
import react, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TouchableHighlight,
  TouchableWithoutFeedback,
  Pressable,
  TextInput,
  Alert,
  ScrollView,
} from "react-native";
import { Fontisto } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { theme } from "./color";

const STORAGE_KEY = "@toDos";

export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [toDos, setToDos] = useState({});
  useEffect(() => {
    loadToDos();
    rememberWorking();
  }, []);
  const travel = async () => {
    try {
      setWorking(false);
      await AsyncStorage.setItem("working", JSON.stringify(false));
    } catch {
      console.log("failed");
    }
  };
  const work = async () => {
    try {
      setWorking(true);
      await AsyncStorage.setItem("working", JSON.stringify(true));
    } catch {
      console.log("failed");
    }
  };
  const onChangeText = (payload) => setText(payload);
  const saveToDos = async (toSave) => {
    // 로딩 state 넣고 실패 했을 시 안내 문 띄어주기
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch {
      console.log("failed");
    }
  };
  const loadToDos = async () => {
    // 로딩 state 넣고 실패 했을 시 안내 문 띄어주기
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      // data !== null ? setToDos(JSON.parse(data)) : null;
      setToDos(JSON.parse(data));
    } catch {
      console.log("failed");
    }
  };
  const addToDo = async () => {
    if (text === "") {
      return;
    }
    /* 
    assign 이용한 (불변성)Immutability 유지
    const newToDos = Object.assign({}, toDos, {
      [Date.now()]: { text, work: working },
    }); 
    */
    // spread 연산자 활용
    const newToDos = {
      ...toDos,
      [Date.now()]: { text, working, complete: false },
    };
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");
  };
  const deleteToDo = (key) => {
    Alert.alert("Delete To Do", "Are you sure?", [
      { text: "Cancel" },
      {
        text: "I'm sure",
        style: "destructive",
        onPress: () => {
          const newToDos = { ...toDos };
          delete newToDos[key];
          setToDos(newToDos);
          saveToDos(newToDos);
        },
      },
    ]);
  };
  const rememberWorking = async () => {
    try {
      const working = await AsyncStorage.getItem("working");
      setWorking(JSON.parse(working));
    } catch {
      console.log("failed");
    }
  };
  const completeToDo = (key) => {
    Alert.alert("Have you finished", "your to-dos?", [
      { text: "Cancel" },
      {
        text: "I'm sure",
        style: "destructive",
        onPress: async () => {
          const newToDos = { ...toDos };
          if (newToDos[key].complete === false) {
            newToDos[key].complete = true;
          } else {
            newToDos[key].complete = false;
          }
          setToDos(newToDos);
          saveToDos(newToDos);
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{ ...styles.btnText, color: working ? "white" : theme.grey }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{
              ...styles.btnText,
              color: !working ? "white" : theme.grey,
            }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>
      <TextInput
        onSubmitEditing={addToDo}
        onChangeText={onChangeText}
        returnKeyType="done"
        value={text}
        placeholder={
          working ? "What do you have to do?" : "Where do you want to go?"
        }
        style={styles.input}
      />
      <ScrollView>
        {Object.keys(toDos).map((key) =>
          toDos[key].working === working ? (
            <View style={styles.toDo} key={key}>
              {toDos[key].complete === false ? (
                <Text style={styles.toDoText}>{toDos[key].text}</Text>
              ) : (
                <Text
                  style={{
                    ...styles.toDoText,
                    textDecorationLine: "line-through",
                    textDecorationColor: "red",
                  }}
                >
                  {toDos[key].text}
                </Text>
              )}

              <View style={styles.ikon}>
                <TouchableOpacity
                  style={{ marginRight: 20 }}
                  onPress={() => completeToDo(key)}
                >
                  <Fontisto
                    name="checkbox-passive"
                    size={18}
                    color={theme.grey}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteToDo(key)}>
                  <Fontisto name="trash" size={18} color={theme.grey} />
                </TouchableOpacity>
              </View>
            </View>
          ) : null
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 100,
  },
  btnText: {
    fontSize: 38,
    fontWeight: "600",
    color: "white",
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 18,
  },
  toDo: {
    backgroundColor: theme.toDoBg,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  ikon: {
    flexDirection: "row",
  },
});
