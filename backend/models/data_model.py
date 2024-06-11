import pandas

def get_games(conn):
    return pandas.read_sql( 
    ''' 
        SELECT * FROM games 
    ''', conn)

