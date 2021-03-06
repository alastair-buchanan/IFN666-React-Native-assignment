import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { View } from "react-native";
import { Text } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { ScreenWidth } from "react-native-elements/dist/helpers";
import { Title } from "react-native-paper";
import { useStockCodes } from "../api/Api";
import { scaleSize } from "../constants/Utils";

/**
 * This function receives an array of objects and number of days to filter by,
 * filters the array and then returns the new array.
 *
 * @param {Array<Object>} data
 * @param {Number} param - number of days
 * @returns {Array<Object>} newData - filtered array
 */
function filterByDate(data, param) {
  var newDate = new Date();
  newDate.setDate(newDate.getDate() - param);
  let newData = {};
  newData = data.filter((stock) => new Date(stock.labels) > newDate);
  return newData;
}

/**
 * ChartConfig contains the configuration information for the graphing component.
 */
const chartConfig = {
  backgroundColor: "#222020",
  backgroundGradientFrom: "#222020",
  backgroundGradientTo: "#222020",
  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.5,
  useShadowColorFromDataset: false,
  fillShadowGradient: "#AD0C0C",
};

/**
 * filterElements receives an array and a number and filters the elements based on
 * thats nth index. This is to reduce the amount of labels showing on the graph.
 *
 * @param {Array} arr
 * @param {Number} nth
 */
const filterElements = (arr, nth) => arr.filter((e, i) => i % nth === nth - 1);

/**
 * This functional component displays the graph of a specific stock, it can be
 * toggled to show percentage data.
 *
 * @param {Object} stockInfo
 */
export const StockGraph = ({ stockInfo }) => {
  const { loading, stocks, error } = useStockCodes(stockInfo.symbol);
  const [labels, setLabels] = useState([]);
  const [values, setValues] = useState([]);
  const [filter, setFilter] = useState(undefined);
  const [toggle, setToggle] = useState(false);

  /**
   * data contains the information displayed on the graph.
   */
  const data = {
    labels: labels,
    datasets: [
      {
        data: values,
        color: (opacity = 1) => `rgba(173, 12, 12, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  /**
   * This function sets the toggle between true and false
   */
  function handleToggle() {
    if (toggle) {
      setToggle(false);
    } else {
      setToggle(true);
    }
  }

  /**
   * This useEffect sets the data for displaying on the graph. This useEffect
   * runs when stocks is initialised and when the filter is toggled or the filter
   * is changed, the filter filters the graph by date, the toggle toggles from
   * absolute and percentage data.
   */
  useEffect(() => {
    if (stocks.length > 0) {
      let newArray = stocks.reverse();
      if (filter !== undefined) {
        newArray = filterByDate(stocks, filter);
      }
      const INDEX = newArray.length / 5;
      let newIndexes = newArray.map((element) => element.labels);
      let newLabels = filterElements(newIndexes, INDEX);
      let reversedLabels = newLabels;
      setLabels(reversedLabels);
      if (toggle) {
        setValues(newArray.map((element) => element.percentage));
      } else {
        setValues(newArray.map((element) => element.data));
      }
    }
  }, [stocks, filter, toggle]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="grey" />
      </View>
    );
  }
  if (error) {
    return <Text style={styles.errorText}>Out of free API calls</Text>;
  }
  return (
    <View style={styles.container}>
      <Title style={styles.cellHeader}>
        <Text style={styles.head}>{stockInfo.name}</Text>
      </Title>
      <View style={styles.filterContainer}>
        <TouchableOpacity
          onPress={() => setFilter(7)}
          style={styles.dateFilter}
        >
          <Text style={styles.filterText}>1W</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setFilter(30)}
          style={styles.dateFilter}
        >
          <Text style={styles.filterText}>1M</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setFilter(60)}
          style={styles.dateFilter}
        >
          <Text style={styles.filterText}>2M</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setFilter(undefined)}
          style={styles.dateFilter}
        >
          <Text style={styles.filterText}>R</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleToggle()}
          style={styles.toggleButton}
        >
          <Text style={styles.filterText}>Toggle</Text>
        </TouchableOpacity>
      </View>

      <LineChart
        data={data}
        yAxisInterval={20}
        xLabelsOffset={10}
        width={ScreenWidth}
        height={scaleSize(210)}
        verticalLabelRotation="330"
        chartConfig={chartConfig}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  head: {
    fontSize: scaleSize(20),
    fontWeight: "bold",
    color: "white",
  },
  cellHeader: {
    justifyContent: "center",
    borderBottomColor: "white",
    borderBottomWidth: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
  },
  errorText: {
    fontSize: scaleSize(20),
    fontWeight: "bold",
    color: "white",
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateFilter: {
    elevation: scaleSize(8),
    backgroundColor: "grey",
    borderRadius: scaleSize(10),
    paddingVertical: scaleSize(10),
    paddingHorizontal: scaleSize(12),
    width: scaleSize(50),
  },
  filterText: {
    fontSize: scaleSize(14),
    color: "#fff",
    fontWeight: "bold",
    alignSelf: "center",
    textTransform: "uppercase",
  },
  toggleButton: {
    elevation: scaleSize(8),
    backgroundColor: "grey",
    borderRadius: scaleSize(10),
    paddingVertical: scaleSize(10),
    paddingHorizontal: scaleSize(12),
    width: scaleSize(100),
  },
  loadingContainer: {
    width: Dimensions.get("window").width,
    justifyContent: "center",
    marginTop: scaleSize(45),
  },
});
