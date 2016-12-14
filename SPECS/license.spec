Name:		license
Version:	%{VER}
Release:	%(date '+%Y%m%d%H')%{?dist}
Summary:	common functions.	

#Group:		ovp	
License:	Properpity
URL:		http://www.thinputer.com	
Source0:	license-%{VER}.tar.gz
BuildRoot:	%(mktemp -ud %{_tmppath}/%{name}-%{version}-%{release}-XXXXXX)

BuildRequires:	gcc
Requires: glibc

%description
This package contains the base license tool used by other OVP components.

%prep
%setup -q -n license


%build
make %{?_smp_mflags}

%install
#rm -rf %{buildroot}
make install DESTDIR=%{buildroot}


%clean
rm -rf %{buildroot}


%files
%{_bindir}/license-tool
#/license-tool

%changelog
* Sat Sep 26 2016 zzw <15219165363@163.com> - 1.0
- build init version.

