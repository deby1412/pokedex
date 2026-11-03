import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, FlatList, Image, 
  SafeAreaView, StatusBar, ActivityIndicator 
} from 'react-native';

const coresTipos = {
  normal: '#A8A878',
  fire: '#F08030',
  water: '#6890F0',
  electric: '#F8D030',
  grass: '#78C850',
  ice: '#98D8D8',
  fighting: '#C03028',
  poison: '#A040A0',
  ground: '#E0C068',
  flying: '#A890F0',
  psychic: '#F85888',
  bug: '#A8B820',
  rock: '#B8A038',
  ghost: '#705898',
  dragon: '#7038F8',
  steel: '#B8B8D0',
  fairy: '#EE99AC',
  default: '#777777',
};

export default function App() {
  const [pokemons, setPokemons] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [proximaUrl, setProximaUrl] = useState('https://pokeapi.co/api/v2/pokemon?limit=20&offset=0');

  useEffect(() => {
    carregarPokemons();
  }, []);

  async function carregarPokemons() {
    if (carregando || !proximaUrl) return;

    try {
      setCarregando(true);
      const resposta = await fetch(proximaUrl);
      const dados = await resposta.json();

      setProximaUrl(dados.next);

      const detalhesPromessas = dados.results.map(async (item) => {
        const resDetalhe = await fetch(item.url);
        const pokeDetalhe = await resDetalhe.json();
        
        return {
          id: pokeDetalhe.id,
          nome: pokeDetalhe.name,
          imagem: pokeDetalhe.sprites.front_default,
          tipos: pokeDetalhe.types.map(t => t.type.name),
        };
      });

      const novosPokemons = await Promise.all(detalhesPromessas);

      setPokemons(prev => {
        const idsExistentes = new Set(prev.map(p => p.id));
        const unicos = novosPokemons.filter(p => !idsExistentes.has(p.id));
        return [...prev, ...unicos];
      });
    } catch (e) {
      console.log('Erro ao carregar pokemons:', e);
    } finally {
      setCarregando(false);
    }
  }

  function renderizarItem({ item }) {
    return (
      <View style={styles.card}>
        <Image source={{ uri: item.imagem }} style={styles.pokeImagem} />
        <View style={styles.pokeInfo}>
          <Text style={styles.pokeId}>Nº {String(item.id).padStart(3, '0')}</Text>
          <Text style={styles.pokeNome}>{item.nome.toUpperCase()}</Text>
          
          <View style={styles.tiposContainer}>
            {item.tipos.map((tipo, index) => {
              const corTipo = coresTipos[tipo] || coresTipos.default;
              return (
                <View key={index} style={[styles.badgeTipo, { backgroundColor: corTipo }]}>
                  <Text style={styles.textoTipo}>{tipo.toUpperCase()}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#cc0000" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pokédex</Text>
        <Text style={styles.headerSubtitle}>Lista Oficial de Pokémon</Text>
      </View>

      <FlatList
        data={pokemons}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={renderizarItem}
        contentContainerStyle={styles.listaContent}
        onEndReached={carregarPokemons}
        onEndReachedThreshold={0.2}
        ListFooterComponent={
          carregando ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="large" color="#cc0000" />
              <Text style={styles.footerText}>Carregando mais Pokémon...</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: '#cc0000',
    borderBottomWidth: 4,
    borderBottomColor: '#2b2b2b',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#ffcccc',
    marginTop: 2,
    fontWeight: '500',
  },
  listaContent: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pokeImagem: {
    width: 80,
    height: 80,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  pokeInfo: {
    flex: 1,
  },
  pokeId: {
    fontSize: 12,
    color: '#666666',
    fontWeight: 'bold',
  },
  pokeNome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginVertical: 2,
  },
  tiposContainer: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  badgeTipo: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  textoTipo: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#666666',
    marginTop: 8,
    fontSize: 13,
    fontWeight: '500',
  },
});