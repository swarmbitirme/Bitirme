import React, { useState, useEffect } from "react";
import { ScrollView } from "react-native";
import {
  StyleSheet,
  Image,
  Text,
  View,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import Touchable from "react-native-platform-touchable";
import { Ionicons } from "@expo/vector-icons";
import Collapsible from "react-native-collapsible";
import { db } from "../firebaseConfig";
const { typeKeys, types } = require("../transactionTypeHelper");
function wait(timeout) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
}
export default function LinksScreen() {
  const [collapseList, setCollapseList] = useState([]);
  const [cancelling, setCancelling] = useState(false);
  const [transactions, setTransactions] = useState(undefined);
  const [refreshing, setRefreshing] = React.useState(true);
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);

    wait(2000).then(() => setRefreshing(false));
  }, [refreshing]);

  useEffect(() => {
    const getTransactions = async () => {
      setTransactions(undefined);
      setCollapseList([]);
      let duties = [];
      let colList = [];
      db.collection("Duties")
        .orderBy("Created_At", "desc")
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            let trans = [];
            //query transaction
            db.collection("DutyTransactions")
              .where("DutyId", "==", doc.id)
              //.orderBy("Created_At", "asc")
              .get()
              .then((qs) => {
                qs.forEach((dc) => {
                  trans.push({ id: dc.id, ...dc.data() });
                });
              })
              .then(() => {
                setTransactions([
                  ...duties,
                  {
                    dutyId: doc.id,
                    location: doc.data().Location,
                    isCompleted: doc.data().isCompleted,
                    transactions: trans,
                  },
                ]);
                setCollapseList([
                  ...colList,
                  { id: doc.id, isCollapsed: false },
                ]);

                duties.push({
                  dutyId: doc.id,
                  location: doc.data().Location,
                  isCompleted: doc.data().isCompleted,
                  transactions: trans,
                });
                colList.push({ id: doc.id, isCollapsed: false });
              });
          });
        });
    };
    if (refreshing) {
      getTransactions();
      wait(2000).then(() => setRefreshing(false));
    }
  }, [refreshing]);
  const handleDutyCanceled = (id) => {
    setCancelling(true);
    db.collection("Duties")
      .doc(id)
      .get()
      .then((doc) => {
        doc.ref.update({ isCompleted: true }).then(() => {
          db.collection("Cars")
            .where("id", "in", doc.data().Cars)
            .get()
            .then((qs) => {
              qs.forEach((car) => {
                car.ref.update({ OnDuty: false });
              });
            });
          db.collection("Locations")
            .where("Location", "==", doc.data().Location)
            .get()
            .then((qs2) => {
              qs2.forEach((loc) => {
                loc.ref.update({ OnDuty: false });
              });
            });
          const newTransaction = {
            DutyId: id,
            Cars: doc.data().Cars,
            Created_At: new Date(),
            Location: doc.data().Location,
            Type: typeKeys.Canceled,
            Description: types[typeKeys.Canceled],
          };
          db.collection("DutyTransactions")
            .add(newTransaction)
            .then(() => {
              onRefresh();
              setCancelling(false);
              setTransactions(undefined);
              setCollapseList([]);
            });
        });
      });
  };

  console.disableYellowBox = true;
  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      style={styles.container}
    >
      {!!transactions &&
        transactions.map((item) => (
          <View>
            <Touchable
              style={styles.option}
              background={Touchable.Ripple("#ccc", false)}
              onPress={() => {
                let newList = [...collapseList];
                newList.map((cl) => {
                  if (cl.id === item.dutyId) cl.isCollapsed = !cl.isCollapsed;
                });
                setCollapseList(newList);
              }}
            >
              <View style={{ flexDirection: "row" }}>
                <View style={styles.optionIconContainer}>
                  <Ionicons name="md-clipboard" size={22} />
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionText}>Duty ID: {item.dutyId}</Text>
                </View>
              </View>
            </Touchable>
            {item.transactions.map((tran, index) => (
              <Collapsible
                collapsed={collapseList.some(
                  (it) => it.id === item.dutyId && !it.isCollapsed
                )}
              >
                <View>
                  {index === 0 && item.isCompleted === false && (
                    <Touchable onPress={() => handleDutyCanceled(item.dutyId)}>
                      <View
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignContent: "center",
                          alignItems: "center",
                          marginTop: 15,
                        }}
                      >
                        <View style={{ flexDirection: "row" }}>
                          {cancelling ? (
                            <ActivityIndicator size="small" color="red" />
                          ) : (
                            <>
                              <View style={styles.optionIconContainer}>
                                <Ionicons
                                  name="ios-close"
                                  color="red"
                                  size={30}
                                />
                              </View>
                              <View style={styles.optionTextContainer}>
                                <Text style={styles.cancelText}>
                                  Cancel Duty
                                </Text>
                              </View>
                            </>
                          )}
                        </View>
                      </View>
                    </Touchable>
                  )}

                  <View style={{ flexDirection: "row" }}>
                    <View style={styles.collapseIcon}>
                      {tran.Type === 2 ? (
                        <Ionicons
                          name="ios-add-circle"
                          size={30}
                          color="orange"
                        />
                      ) : tran.Type === 3 ? (
                        <Ionicons name="ios-construct" size={30} color="pink" />
                      ) : tran.Type === 4 ? (
                        <Ionicons
                          name="ios-checkmark-circle"
                          size={30}
                          color="green"
                        />
                      ) : tran.Type === 6 ? (
                        <Ionicons name="ios-close" size={50} color="red" />
                      ) : (
                        <></>
                      )}
                    </View>
                    <View style={styles.collapseContainer}>
                      <Text style={styles.optionText}>
                        Cars: {tran.Cars.join(",")}
                      </Text>
                      <Text style={styles.optionText}>
                        Location: {item.location}
                      </Text>
                      <Text style={styles.optionText}>
                        Statu: {tran.Description}
                      </Text>
                      <Text style={styles.optionText}>
                        Created At: {tran.Created_At.toDate().toLocaleString()}
                      </Text>
                    </View>
                  </View>
                </View>
              </Collapsible>
            ))}
          </View>
        ))}
    </ScrollView>
  );
}

LinksScreen.navigationOptions = {
  title: "Duty Transactions",
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  optionsTitleText: {
    fontSize: 16,
    marginLeft: 15,
    marginTop: 9,
    marginBottom: 12,
  },
  optionIconContainer: {
    marginRight: 9,
  },
  collapseIcon: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 15,
  },
  option: {
    backgroundColor: "#fdfdfd",
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#EDEDED",
  },
  optionText: {
    fontSize: 15,
    marginTop: 1,
    fontWeight: "bold",
  },
  cancelText: {
    fontSize: 15,
    marginTop: 7,
    fontWeight: "bold",
    color: "red",
  },
  collapseContainer: {
    padding: 15,
  },
});
