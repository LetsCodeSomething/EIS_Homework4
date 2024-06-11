import React, { useEffect, useState } from 'react';
import {Table} from "./Table";
import {Graph} from "./Graph";

export function DataLoader() {
	const [dataset, setDataset] = useState(0);
	const [isLoading, setLoading] = useState(true);
	const [isError, setError] = useState(false);
	
	useEffect(() => {
		fetch('/data').then((response) => {
			if (response.ok) {
				return response.json();
			}
		})
		.then(data => {
			setDataset(JSON.parse(data));
			setLoading(false);
		})
		.catch((error) => {
			setError(true);
		});
	}, []);
  
	if (isError) {
		return <div className="App">Internal server error</div>;
	}
	else if (isLoading) {
		return <div className="App">Загрузка...</div>;
    }
    return (
		<>
			<h3>Рейтинг компьютерных игр</h3>
			<Graph dataset={dataset}/>
			<Table dataset={dataset} rowsPerPage="25" selectedPage="0"/>
		</>	
    );
}