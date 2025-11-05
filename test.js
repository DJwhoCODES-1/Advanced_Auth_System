const sherifObj = {
  name: "Devanshu",
  age: 24,
  gender: "M",
  tags: ["Golang", "Javascript", "Typescript", "NodeJs"],
  core: ["HLD", "LLD", "DSA", "CN", "DBMS", "OS"],
};

const sherifKey = JSON.parse(JSON.stringify(sherifObj)); // Deep Copy
// const sherifKey = { ...sherifObj }; // Shallow Copy

sherifKey["tags"][4] = "C++";

console.log(sherifObj, sherifKey);
