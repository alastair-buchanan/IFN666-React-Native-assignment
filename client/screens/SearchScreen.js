import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useStocksContext } from "../contexts/StocksContext";
import { useStockList } from "../api/Api";
import { SearchBar } from "react-native-elements";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DataTable } from "react-native-paper";
import { scaleSize } from "../constants/Utils";

/**
 * Functional component SearchScreen allows the user to search for a stock
 * and add it to their watch list. 
 */
export default function SearchScreen({ navigation }) {
  const {
    addToWatchlist,
    getStocksFromDB,
    _retrieveData,
    initialiseContextState,
  } = useStocksContext();
  const { stockList } = useStockList();
  const [rowData, setRowData] = useState([]);
  const [searchQuery, setSearchQuery] = useState(null);

  /**
   * This function sets the search query string when text is typed
   * into the input search field.
   * 
   * @param {string} query 
   */
  const onChangeSearch = (query) => setSearchQuery(query);

  /**
   * This function filters stocks by symbol and company name.
   * 
   * @param {Array.<Object>} data 
   * @param {string} param 
   * @returns {Array.<Object>}
   */
  function filterBySearch(data, param) {
    return data.filter(
      (stock) =>
        stock.Symbol.startsWith(param.toUpperCase()) ||
        stock.Name.startsWith(param)
    );
  }

  /**
   * This async function retrieves data from async storage and the database and initialises
   * it in stocksContext state.
   */
  async function initialiseData() {
    var newState = [];
    var newStocksFromDB = await getStocksFromDB();
    var newStocksFromAsync = await _retrieveData(); 
    if (newStocksFromAsync !== undefined || newStocksFromAsync !== null) {
      newStocksFromAsync.map((element) => newState.push(element));
    }

    if (newStocksFromDB !== undefined || newStocksFromDB !== null) {
      newStocksFromAsync.map((element) => {
        let isInvalidElement = newState.includes(element);
        if (!isInvalidElement) {
          newState.push(element);
          AsyncStorage.setItem(element, element);
        }
      });
    }
    initialiseContextState(newState);
  }

  /**
   * This function handles the onPress event of a stock. The stock is added
   * to watch list and the token is pulled from async storage. If the token is
   * missing the user will be redirected back to the sign in screen, if the token
   * is valid, the user will be redirected to the stocks screen.
   * 
   * @param {string} props 
   */
  async function onPress(props) {
    await addToWatchlist(props);
    const getTokenFromAsync = await AsyncStorage.getItem("token");

    if (getTokenFromAsync === null) {
      navigation.navigate("SignInScreen");
    } else {
      navigation.navigate("Stocks");
    }
  }

  /**
   * This useEffect calls the initialiseData function on start up.
   */
  useEffect(() => {
    initialiseData();
  }, []);

  /**
   * This useEffect initialises the data for the displayed flatlist, it is triggered
   * and filters the data when the filter is changed.
   */
  useEffect(() => {
    let data = stockList;
    if (searchQuery !== null) {
      data = filterBySearch(data, searchQuery);
    }
    setRowData(data);
  }, [stockList, searchQuery, rowData.props]);

  /**
   * The stock function is rendered as each element in the flatlist
   * 
   * @param {Object} item 
   * @returns stock component
   */
  function stock({ item }) {
    return (
      <TouchableOpacity
        style={styles.symbolButton}
        onPress={() => onPress(item.Symbol)}
      >
        <DataTable>
          <DataTable.Row>
            <DataTable.Cell>
              <Text style={styles.symbolText}>{item.Symbol}</Text>
            </DataTable.Cell>
            <DataTable.Cell>
              <Text style={styles.industryText}>{item.Industry}</Text>
            </DataTable.Cell>
          </DataTable.Row>
          <DataTable.Row>
            <Text style={styles.symbolText}>{item.Name}</Text>
          </DataTable.Row>
        </DataTable>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>
        Type a company name or a stock symbol.
      </Text>
      <SearchBar
        placeholder="Search Stocks Here..."
        onChangeText={onChangeSearch}
        value={searchQuery}
        platform="android"
      />

      <FlatList
        data={rowData}
        renderItem={stock}
        keyExtractor={(element) => element.Symbol}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  titleText: {
    color: "white",
    fontSize: scaleSize(15),
    textAlign: "center",
    paddingBottom: scaleSize(10),
  },
  symbolText: {
    color: "white",
    fontSize: scaleSize(20),
  },
  industryText: {
    color: "grey",
    fontSize: scaleSize(20),
  },
  symbolButton: {
    marginTop: scaleSize(20),
    padding: scaleSize(15),

    borderWidth: scaleSize(1),
    borderBottomColor: "grey",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    marginTop: scaleSize(20),
  },
});
