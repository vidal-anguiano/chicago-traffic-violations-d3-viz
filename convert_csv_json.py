import csv
import json
import argparse
import pandas as pd

def convert(filename, lines):
    data = pd.read_csv(filename)
    out = data.to_json(orient='records')
    with open(filename[:-4] + '.json', 'w') as f:
        f.write(out)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Parse filename for csv to json converter.')
    parser.add_argument('filename', type=str,
                        help='CSV filename')
    parser.add_argument('lines', type=int,
                        help='number of lines')

    args = parser.parse_args()
    convert(args.filename, args.lines)
