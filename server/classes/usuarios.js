// {
//     id: 'ALkjdaklsdj-asdkj',
//     nombre: 'Fernando',
// }

class Usuarios {
	constructor() {
		this.personas = [
			{ id: 1, nombre: 'Prueba 1' },
			{ id: 2, nombre: 'Prueba 2' },
			{ id: 3, nombre: 'Prueba 3' },
			{ id: 4, nombre: 'Prueba 4', oponente: 1 }
		];
	}

	agregarPersona(id, nombre) {
		let persona = { id, nombre };
		this.personas.push(persona);

		return this.personas;
	}

	agregarOponente(id, otherID) {
		let personaIndex = this.personas.findIndex((persona) => persona.id === id);
		let OponenteIndex = this.personas.findIndex((persona) => persona.id === otherID);
		this.personas[OponenteIndex].oponente = id;
		this.personas[personaIndex].oponente = id;
		return this.personas;
	}

	getPersona(id) {
		let persona = this.personas.filter((persona) => persona.id === id)[0];

		return persona;
	}

	getPersonas() {
		return this.personas;
	}
	getPersonasAvailable() {
		let personas = this.personas.filter((persona) => !persona.oponente);
		return personas;
	}
	getPersonasPorSala(sala) {
		let personasEnSala = this.personas.filter((persona) => persona.sala === sala);
		return personasEnSala;
	}

	borrarPersona(id) {
		let personaBorrada = this.getPersona(id);

		this.personas = this.personas.filter((persona) => persona.id != id);

		return personaBorrada;
	}
}

module.exports = {
	Usuarios
};
