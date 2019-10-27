import React, { Component } from 'react';
import { FaGithubAlt, FaPlus, FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import api from '../../services/api';
import { Form, SubmitButton, List } from './styles';
import Container from '../../Components/Container';

export default class Main extends Component {
	state = {
		newRepo: '',
		repositories: [],
		loading: false,
		error: false,
	};

	componentDidMount() {
		const repositories = localStorage.getItem('repositories');

		if (repositories) {
			this.setState({ repositories: JSON.parse(repositories) });
		}
	}

	componentDidUpdate(_, prevState) {
		const { repositories } = this.state;
		if (prevState.repositories !== repositories) {
			localStorage.setItem('repositories', JSON.stringify(repositories));
		}
	}

	handleInputChange = e => {
		this.setState({ newRepo: e.target.value });
	};

	handleSubmit = async e => {
		e.preventDefault();

		this.setState({ loading: true });
		const { newRepo, repositories } = this.state;

		try {
			if (repositories.some(v => v.name === newRepo)) {
				throw new Error('Repositório duplicado');
			}
			const response = await api.get(`/repos/${newRepo}`);

			const data = {
				name: response.data.full_name,
			};

			this.setState({
				repositories: [...repositories, data],
				newRepo: '',
				loading: false,
				error: false,
			});
		} catch {
			this.setState({
				error: true,
				loading: false,
			});
		}
		const { error } = this.state;
		console.log(error);
	};

	render() {
		const { newRepo, repositories, loading, error } = this.state;
		return (
			<Container>
				<h1>
					<FaGithubAlt />
					Repositórios
				</h1>

				<Form onSubmit={this.handleSubmit} error={String(error)}>
					<input
						type="text"
						placeholder="Adicionar repositório"
						value={newRepo}
						onChange={this.handleInputChange}
					/>

					<SubmitButton loading={String(loading)}>
						{loading ? (
							<FaSpinner color="#FFF" size={14} />
						) : (
							<FaPlus color="#FFF" size={14} />
						)}
					</SubmitButton>
				</Form>

				<List>
					{repositories.map(repository => (
						<li key={repository.name}>
							<span>{repository.name}</span>
							<Link
								to={`/repository/${encodeURIComponent(
									repository.name
								)}`}
							>
								Detalhes
							</Link>
						</li>
					))}
				</List>
			</Container>
		);
	}
}
