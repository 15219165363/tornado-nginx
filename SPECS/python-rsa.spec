#
# spec file for package python-rsa
#
#
#

Name:           python-rsa
Version:        3.1.1
Release:        2.1.1
Url:            http://stuvel.eu/rsa
Summary:        Pure-Python RSA Implementation
License:        Apache-2.0
Group:          Development/Languages/Python
Source:         http://pypi.python.org/packages/source/r/rsa/rsa-%{version}.tar.gz
BuildRoot:      %{_tmppath}/%{name}-%{version}-build
BuildRequires:  python-devel
BuildRequires:  python-distribute
BuildRequires:  python-pyasn1
Requires:       python-pyasn1
BuildArch:      noarch

%description
Python-RSA is a pure-Python RSA implementation. It supports encryption and
decryption, signing and verifying signatures, and key generation according to
PKCS#1 version 1.5.

%prep
%setup -q -n rsa-%{version}

%build
python setup.py build

%install
python setup.py install --prefix=%{_prefix} --root=%{buildroot}

%check
#python setup.py test

%files
%defattr(-,root,root,-)
%doc LICENSE
%{_bindir}/pyrsa-*
%{python_sitelib}/*

%changelog
* Fri Mar 22 2016 15219165363@163.com
- Initial release
