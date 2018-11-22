import styled from 'styled-components';

const Table = styled.table`
  border-spacing: 0;
  width: 100%;
  min-width: 1000px;
  border: 1px solid ${props => props.theme.offWhite};
  thead {
    font-size: 10px;
  }
  td {
    font-size: 12px;
  }
  th {
    border-bottom: 1px solid ${props => props.theme.offWhite};
    border-right: 1px solid ${props => props.theme.offWhite};
    margin: 10px 5px;
    position: relative;
    min-width: 80px;
    &:last-child {
      border-right: none;
      width: 150px;
      button {
        width: 100%;
      }
      &:first-child {
          padding: 10px 50px;
        width: 260px;
      }
    }
    label {
        padding: 10px 5px;
      display: block;
    }
  }
  tr {
    &:hover {
      background: ${props => props.theme.offWhite};
    }
    .perm {
      background: ${props => props.theme.red};
      color: white;
    }
  }
`;

export default Table;
