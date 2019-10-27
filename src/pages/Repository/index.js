import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import api from '../../services/api';

import Container from '../../Components/Container';
import {
	Loading,
	Owner,
	IssueList,
	Box,
	Button,
	ButtonPaginate,
} from './styles';

const capitalize = s => {
	if (typeof s !== 'string') return '';
	return s.charAt(0).toUpperCase() + s.slice(1);
};

export default class Repository extends Component {
	static propTypes = {
		match: PropTypes.shape({
			params: PropTypes.shape({
				repository: PropTypes.string,
			}),
		}).isRequired,
	};

	state = {
		repository: {},
		issues: [],
		loading: true,
		filterIndex: 0,
		filterIssues: ['all', 'open', 'closed'],
		perPage: 5,
		currentPage: 1,
	};

	async componentDidMount() {
		const { match } = this.props;
		const { filterIssues, filterIndex, currentPage, perPage } = this.state;

		const repoName = decodeURIComponent(match.params.repository);

		const [repository, issues] = await Promise.all([
			api.get(`/repos/${repoName}`),
			api.get(`/repos/${repoName}/issues`, {
				params: {
					state: filterIssues[filterIndex],
					page: currentPage,
					per_page: perPage,
				},
			}),
		]);
		this.setState({
			repository: repository.data,
			issues: issues.data,
			loading: false,
		});
	}

	handleIssueFilterChange = async (e, value) => {
		this.setState({
			loading: true,
		});
		const { match } = this.props;
		const { filterIssues, perPage, currentPage } = this.state;
		const repoName = decodeURIComponent(match.params.repository);

		const issues = await api.get(`/repos/${repoName}/issues`, {
			params: {
				state: filterIssues[value],
				per_page: perPage,
				page: currentPage,
			},
		});

		this.setState({
			filterIndex: value,
			issues: issues.data,
			loading: false,
		});
	};

	handlePageChange = async (e, currentPage) => {
		this.setState({
			currentPage,
			loading: true,
		});

		const { match } = this.props;
		const { filterIssues, filterIndex, perPage } = this.state;
		const repoName = decodeURIComponent(match.params.repository);

		const issues = await api.get(`/repos/${repoName}/issues`, {
			params: {
				state: filterIssues[filterIndex],
				per_page: perPage,
				page: currentPage,
			},
		});

		this.setState({
			issues: issues.data,
			loading: false,
		});
	};

	render() {
		const {
			repository,
			issues,
			loading,
			filterIssues,
			currentPage,
			perPage,
		} = this.state;

		if (loading) {
			return <Loading>Carregando</Loading>;
		}
		return (
			<Container>
				<Owner>
					<Link to="/">Voltar aos repositórios</Link>
					<img
						src={repository.owner.avatar_url}
						alt={repository.owner.login}
					/>

					<h1>{repository.name}</h1>
					<p>{repository.description}</p>
				</Owner>

				<Box>
					{filterIssues.map((filter, index) => (
						<Button
							key={String(index)}
							onClick={e =>
								this.handleIssueFilterChange(e, index)
							}
						>
							{capitalize(filterIssues[index])} Issues
						</Button>
					))}
				</Box>

				<IssueList>
					{issues.map(issue => (
						<li key={String(issue.id)}>
							<img
								src={issue.user.avatar_url}
								alt={issue.user.login}
							/>
							<div>
								<strong>
									<a href={issue.html_url}>{issue.title}</a>
									{issue.labels.map(label => (
										<span key={String(label.id)}>
											{label.name}
										</span>
									))}
								</strong>
								<p>{issue.user.login}</p>
							</div>
						</li>
					))}
				</IssueList>

				<Box>
					<ButtonPaginate
						page={currentPage}
						type="prev"
						onClick={e => this.handlePageChange(e, currentPage - 1)}
					>
						Previous
					</ButtonPaginate>
					<strong>Page {currentPage}</strong>
					<ButtonPaginate
						page={currentPage}
						type="next"
						end={String(issues.length < perPage)}
						onClick={e => this.handlePageChange(e, currentPage + 1)}
					>
						Next
					</ButtonPaginate>
				</Box>
			</Container>
		);
	}
}
