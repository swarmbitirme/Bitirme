import React, { useEffect, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  View,
  ImageBackground,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { db, socket } from "../firebaseConfig";
import {
  Card,
  Subtitle,
  Caption,
  Icon,
  Button,
  Image,
  Text,
} from "@shoutem/ui";
function wait(timeout) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
}
let allLocs = [];
export default function HomeScreen() {
  const cl = "Locations";
  const [locs, setLocs] = useState(undefined);
  const [refreshing, setRefreshing] = React.useState(false);
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);

    wait(2000).then(() => setRefreshing(false));
  }, [refreshing]);

  useEffect(() => {
    let locs = [];
    db.collection(cl)
      .orderBy("id", "asc")
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          let imgSrc = "";
          if (doc.data().id === 1) {
            imgSrc = require("../assets/images/A.png");
          } else if (doc.data().id === 2) {
            imgSrc = require("../assets/images/B.png");
          } else {
            imgSrc = require("../assets/images/C.png");
          }
          locs.push({
            ...doc.data(),
            src: imgSrc,
          });
        });
      })
      .then(() => {
        setLocs(locs);
        allLocs = locs;
      });
  }, [refreshing]);

  const handleOrder = (loc) => {
    socket.emit("order", loc);
  };

  useEffect(() => {
    socket.off("progress");
    socket.on("progress", (loc) => {
      let newLocs = [...allLocs];
      newLocs.map((item) => {
        if (item.Location === loc.Location) item.OnDuty = loc.OnDuty;
      });
      setLocs(newLocs);
    });
    // eslint-disable-next-line
  }, [socket]);

  useEffect(() => {
    socket.emit("joinGroup", 1);
    socket.emit("joinGroup", 2);
    socket.emit("joinGroup", 3);
    socket.off("alert");
    socket.on("alert", (msg) => {
      Alert.alert("Sorry", msg);
    });
    // eslint-disable-next-line
  }, [socket]);

  console.disableYellowBox = true;
  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <ImageBackground
        source={require("../assets/images/tires.jpg")}
        style={{ width: "100%", height: "100%" }}
      >
        <View style={styles.container}>
          {!!locs &&
            locs.map((item, index) => (
              <Card key={index} style={styles.shoutemCard}>
                <Image styleName="medium-square" source={item.src} />
                <View styleName="content">
                  <Subtitle>Remaining Pieces: {item.PieceCount}</Subtitle>
                  <View styleName="horizontal v-center space-between">
                    <Caption>Brand: {item.Brand}</Caption>
                    <Button styleName="tight clear">
                      <Icon name="add-event" />
                    </Button>
                  </View>
                  {item.OnDuty ? (
                    <ActivityIndicator size="large" color="green" />
                  ) : (
                    <Button
                      onPress={() => {
                        handleOrder(item);
                      }}
                      styleName="secondary"
                    >
                      <Text>BRING TIRES</Text>
                    </Button>
                  )}
                  <Button styleName="tight clear">
                    <Icon name="add-event" />
                  </Button>
                </View>
              </Card>
            ))}
        </View>
      </ImageBackground>
    </ScrollView>
  );
}

HomeScreen.navigationOptions = {
  header: null,
};

const styles = StyleSheet.create({
  locations: {
    marginTop: 90,
  },
  shoutemCard: {
    borderRadius: 20,
    shadowOpacity: 20,
    marginBottom: 40,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: 200,
  },
  locText: {
    fontSize: 36,
    color: "rgba(96,100,109, 1)",
    lineHeight: 36,
    textAlign: "center",
  },
  locButton: {},
  container: {
    display: "flex",
    alignItems: "center",
    padding: 50,
  },
  developmentModeText: {
    marginBottom: 20,
    color: "rgba(0,0,0,0.4)",
    fontSize: 14,
    lineHeight: 19,
    textAlign: "center",
  },
  contentContainer: {
    paddingTop: 30,
  },
  welcomeContainer: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  welcomeImage: {
    width: 100,
    height: 80,
    resizeMode: "contain",
    marginTop: 3,
    marginLeft: -10,
  },
  getStartedContainer: {
    alignItems: "center",
    marginHorizontal: 50,
  },
  homeScreenFilename: {
    marginVertical: 7,
  },
  codeHighlightText: {
    color: "rgba(96,100,109, 0.8)",
  },
  codeHighlightContainer: {
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 3,
    paddingHorizontal: 4,
  },
  getStartedText: {
    fontSize: 17,
    color: "rgba(96,100,109, 1)",
    lineHeight: 24,
    textAlign: "center",
  },
  tabBarInfoContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: "black",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 20,
      },
    }),
    alignItems: "center",
    backgroundColor: "#fbfbfb",
    paddingVertical: 20,
  },
  tabBarInfoText: {
    fontSize: 17,
    color: "rgba(96,100,109, 1)",
    textAlign: "center",
  },
  navigationFilename: {
    marginTop: 5,
  },
  helpContainer: {
    marginTop: 15,
    alignItems: "center",
  },
  helpLink: {
    paddingVertical: 15,
  },
  helpLinkText: {
    fontSize: 14,
    color: "#2e78b7",
  },
});
