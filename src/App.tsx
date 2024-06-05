import "./App.css";
import { useId, FormEvent, useState, ChangeEvent } from "react";

enum SelectOptionsEnum {
  USER = "user",
  REPO = "repo",
}

enum EndpointsEnum {
  USER = "https://api.github.com/users/",
  REPO = "https://api.github.com/repos/",
}

const SELECT_OPTIONS = [SelectOptionsEnum.USER, SelectOptionsEnum.REPO];

const endpointsConfig = {
  [SelectOptionsEnum.USER]: EndpointsEnum.USER,
  [SelectOptionsEnum.REPO]: EndpointsEnum.REPO,
};

type FormData = {
  searchName: string;
  endpoint: EndpointsEnum;
};

type FormComponentProps = {
  setInfo: (data: UserData | RepoData | null) => void;
};

const chooseData = (
  data: Record<string, unknown>
): UserData | RepoData | null => {
  if (data.public_repos)
    return { fullName: data.name, repos: data.public_repos } as UserData;
  if (data.stargazers_count)
    return { name: data.name, stars: data.stargazers_count } as RepoData;
  return null;
};

function FormComponent(props: FormComponentProps) {
  const [formData, setFormData] = useState<FormData>({
    searchName: "",
    endpoint: endpointsConfig[SelectOptionsEnum.USER],
  });

  const onSubmitHandler = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const sendRequest = async () => {
      if (!formData.searchName) return alert("Please enter name");
      try {
        const res = await fetch(`${formData.endpoint}${formData.searchName}`);
        if (res.status === 404) {
          props.setInfo(null);
          return;
        }
        const result = await res.json();
        if (result.public_repos || result.stargazers_count) {
          const preparedResult = chooseData(result);
          props.setInfo(preparedResult);
        }
      } catch (error) {
        console.log(error);
      }
    };
    sendRequest();
  };

  const handleChange = (
    event: ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = event.target;
    setFormData((prevState) => {
      if (name === "endpoint") {
        return {
          ...prevState,
          [name]: value as EndpointsEnum,
          searchName: "",
        };
      }
      return {
        ...prevState,
        [name]: value,
      };
    });
  };

  return (
    <form onSubmit={onSubmitHandler} className="form-component">
      <input
        name="searchName"
        onChange={handleChange}
        type="text"
        id="form-component-input"
        value={formData.searchName}
      />
      <select
        onChange={handleChange}
        name="endpoint"
        id="form-component-select"
        value={formData.endpoint}
      >
        {SELECT_OPTIONS.map((option) => {
          const optionKey = useId();
          return (
            <option key={optionKey} value={endpointsConfig[option]}>
              {option}
            </option>
          );
        })}
      </select>
      <button type="submit">Search</button>
    </form>
  );
}

type UserData = {
  fullName: string;
  repos: number;
};

type RepoData = {
  stars: number;
  name: string;
};

type InfoComponentProps = {
  info: UserData | RepoData | null;
};

function InfoComponent(props: InfoComponentProps) {
  if (!props.info) return null;
  if ("stars" in props.info) {
    //RepoData
    return (
      <div>
        <p>Repo: {props.info.name}</p>
        <p>Stars count: {props.info.stars}</p>
      </div>
    );
  }

  if ("fullName" in props.info) {
    //UserData
    return (
      <div>
        <p>User: {props.info.fullName}</p>
        <p>Repos count: {props.info.repos}</p>
      </div>
    );
  }

  return null;
}

function App() {
  const [info, setInfo] = useState<UserData | RepoData | null>(null);
  return (
    <>
      <FormComponent setInfo={setInfo} />
      <InfoComponent info={info} />
    </>
  );
}

export default App;
