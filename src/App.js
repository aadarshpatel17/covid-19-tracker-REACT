import React, { useEffect, useState } from 'react';
import {
  MenuItem,
  FormControl,
  Select,
  Card,
  CardContent,
} from "@material-ui/core";
import InfoBox from './InfoBox';
import Map from './Map';
import Table from "./Table";
import { sortData, prettyPrintStat } from "./util";
import LineGraph from "./LineGraph";
import './App.css';
import "leaflet/dist/leaflet.css";

function App() {

  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState(["worldwide"]);
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 });
  const [mapZoom, setMapZoom] = useState(3);
  const [mapCountries, setMapCountries] = useState([]);
  const [casesType, setCasesType] = useState("cases");
  //STATE = How to write a variable in REACT <<<<

  //links
  // https://disease.sh/v3/covid-19/countries

  //USEEFFECT = Runs a piece of code based on a given condition

  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
    .then(response => response.json())
    .then(data => {
      setCountryInfo(data);
    });
  }, []); 



  useEffect(() => {
    //The code inside here will run once when the component loads and not again
    //async -> send a request, wait for it, do something with info.

    const getCountriesData = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries")
        .then((response) => response.json())
        .then((data) => {
          const countries = data.map((country) => ({
            name: country.country, // United State, India, Pakistan
            value: country.countryInfo.iso2 //UK, USA, FR
          }));

          const sortedData = sortData(data);
          setTableData(sortedData);
          setMapCountries(data);
          setCountries(countries);
        });
    };
    getCountriesData();
  }, []);


  const onCountryChange = async (event) => {
    const countryCode = event.target.value;
    setCountry(countryCode);

    const url = countryCode === 'worldwide' ? 'https://disease.sh/v3/covid-19/all' : `https://disease.sh/v3/covid-19/countries/${countryCode}`;

    await fetch(url)
    .then(response => response.json()) 
    .then(data => {
      setCountry(countryCode);
      //All of the data from the country response
      setCountryInfo(data);

      setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
      setMapZoom(4);
    });

    //links
    // https://disease.sh/v3/covid-19/all
    // https://disease.sh/v3/covid-19/countries/[COUNTRY_CODE]
}; 


  return (
    <div className="app">
      <div className="app__left">
        <div className="app__header">
          {/* Header */}
          {/* Title + select input dropdown field */}
          <h1>COVID-19 TRACKER</h1>
          <FormControl className="app__dropdown">
            <Select variant="outlined" value={country} onChange={onCountryChange}>
              {/* Loop through all the countries and show a drop down list of the options */}
              <MenuItem value="worldwide">Worldwide</MenuItem>
              {countries.map(country => (
                <MenuItem value={country.value}>{country.name}</MenuItem>
              ))}

              {/* <MenuItem Value="worldwide">Worldwide</MenuItem>
            <MenuItem Value="worldwide">Worldwide</MenuItem>
            <MenuItem Value="worldwide">Worldwide</MenuItem>
            <MenuItem Value="worldwide">Worldwide</MenuItem> */}
            </Select>
          </FormControl>
        </div>


        <div className="app__stats">
          <InfoBox isRed active={casesType === "cases"} onClick={e => setCasesType('cases')} title="Coronavirus Cases" cases={prettyPrintStat(countryInfo.todayCases)} total={countryInfo.cases} />

          <InfoBox active={casesType === "recovered"} onClick={e => setCasesType('recovered')} title="Recovered" cases={prettyPrintStat(countryInfo.todayRecovered)} total={countryInfo.recovered} />

          <InfoBox isRed active={casesType === "deaths"} onClick={e => setCasesType('deaths')} title="Deaths" cases={prettyPrintStat(countryInfo.todayDeaths)} total={countryInfo.deaths} />

          {/* InfoBoxs title="Coronavirus cases" */}
          {/* InfoBoxs title="Recovered"  */}
          {/* InfoBoxs title="Deaths  "  */}

        </div>

        {/* Map */}
        <Map
          casesType={casesType}
          countries = {mapCountries}
          center = {mapCenter}
          zoom = {mapZoom}
        />
      </div>
      <Card className="app__right">
        <CardContent>
          <h3>Live Cases by Country</h3>
          {/* Table */}
           <Table countries={tableData} />
          <h2 className="app__graphTitle">Worldwide new {casesType} </h2>
          {/* Graph */}
          <LineGraph className="app__graph" casesType={casesType} />


        </CardContent>
      </Card>
    </div>
  );
}

export default App;
